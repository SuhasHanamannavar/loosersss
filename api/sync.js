const { ScanCommand, PutItemCommand, DeleteItemCommand } = require('@aws-sdk/client-dynamodb');
const { getClient, DATA_TABLE, REGION } = require('./_db');

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const client = getClient();

  if (req.method === 'GET') {
    if (!client) {
      return res.status(200).json({
        ok: true,
        connected: false,
        note: 'Control plane operating in clean local mode (configure AWS credentials in Vercel to sync)',
        actors: [],
        assets: [],
        registry: [],
        audit: [],
        keys: []
      });
    }

    try {
      const scanCmd = new ScanCommand({
        TableName: DATA_TABLE,
        FilterExpression: 'begins_with(PK, :prefix)',
        ExpressionAttributeValues: {
          ':prefix': { S: 'CHECKMATE#' }
        }
      });
      const result = await client.send(scanCmd);
      const items = result.Items || [];

      const actors = [];
      const assets = [];
      const registry = [];
      const audit = [];
      const keys = [];

      items.forEach(item => {
        try {
          const pk = item.PK.S;
          if (pk === 'CHECKMATE#KEYS') {
            keys.push({
              id: item.SK.S.replace('KEY#', ''),
              name: item.name ? item.name.S : 'API Key',
              prefix: item.prefix ? item.prefix.S : 'ck_live_***',
              status: item.status ? item.status.S : 'ACTIVE',
              scopes: item.scopes ? JSON.parse(item.scopes.S) : ['read', 'protected_read', 'workspace_activation'],
              created_at: item.created_at ? item.created_at.S : new Date().toISOString(),
              last_used: item.last_used ? item.last_used.S : 'never'
            });
          } else if (pk === 'CHECKMATE#DECISIONS') {
            const rawTime = item.time ? item.time.S : '';
            audit.push({
              id: item.requestId ? item.requestId.S : item.SK.S,
              ts: rawTime,
              time: rawTime.length >= 19 ? rawTime.substring(11, 19) : rawTime,
              actor: item.actor ? item.actor.S : '',
              asset: item.asset ? item.asset.S : '',
              mode: item.mode ? item.mode.S : 'READ',
              decision: item.decision ? item.decision.S : 'ALLOW'
            });
          } else if (item.data && item.data.S) {
            const data = JSON.parse(item.data.S);
            if (pk === 'CHECKMATE#ACTOR') actors.push(data);
            else if (pk === 'CHECKMATE#ASSET') assets.push(data);
            else if (pk === 'CHECKMATE#REVOKED') registry.push(data);
            else if (pk === 'CHECKMATE#AUDIT') audit.push(data);
            else if (pk === 'CHECKMATE#KEY') keys.push(data);
          }
        } catch (e) {}
      });

      registry.sort((a, b) => (b.ts || '').localeCompare(a.ts || ''));
      audit.sort((a, b) => (b.ts || '').localeCompare(a.ts || ''));

      return res.status(200).json({
        ok: true,
        connected: true,
        aws: { region: REGION, table: DATA_TABLE },
        actors,
        assets,
        registry,
        audit,
        keys
      });
    } catch (err) {
      console.error('DynamoDB sync get error:', err);
      return res.status(200).json({
        ok: true,
        connected: false,
        error: err.message,
        actors: [],
        assets: [],
        registry: [],
        audit: [],
        keys: []
      });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const action = body.action;
      const data = body.data;

      if (!action || !data) {
        return res.status(400).json({ ok: false, error: 'action and data required' });
      }

      if (!client) {
        return res.status(200).json({ ok: true, saved: true, localOnly: true });
      }

      let pk = '';
      let sk = '';

      if (action === 'provision_actor') {
        pk = 'CHECKMATE#ACTOR';
        sk = data.id;
      } else if (action === 'revoke_actor') {
        pk = 'CHECKMATE#REVOKED';
        sk = data.actor || data.id;
      } else if (action === 'register_asset') {
        pk = 'CHECKMATE#ASSET';
        sk = data.id;
      } else if (action === 'log_audit') {
        pk = 'CHECKMATE#AUDIT';
        sk = data.id || ('req-' + Date.now());
      } else if (action === 'create_key') {
        pk = 'CHECKMATE#KEY';
        sk = data.id || ('key-' + Date.now());
      } else if (action === 'reset_state') {
        const scanCmd = new ScanCommand({
          TableName: DATA_TABLE,
          FilterExpression: 'begins_with(PK, :prefix)',
          ExpressionAttributeValues: { ':prefix': { S: 'CHECKMATE#' } }
        });
        const scanRes = await client.send(scanCmd);
        for (const item of (scanRes.Items || [])) {
          await client.send(new DeleteItemCommand({
            TableName: DATA_TABLE,
            Key: { PK: item.PK, SK: item.SK }
          }));
        }
        return res.status(200).json({ ok: true, cleared: true });
      }

      if (pk && sk) {
        const putCmd = new PutItemCommand({
          TableName: DATA_TABLE,
          Item: {
            PK: { S: pk },
            SK: { S: sk },
            data: { S: JSON.stringify(data) },
            updated_at: { S: new Date().toISOString() }
          }
        });
        await client.send(putCmd);
        return res.status(200).json({ ok: true, saved: true, pk, sk });
      }

      return res.status(400).json({ ok: false, error: 'unsupported action' });
    } catch (err) {
      console.error('DynamoDB sync post error:', err);
      return res.status(500).json({ ok: false, error: err.message });
    }
  }

  return res.status(405).json({ ok: false, error: 'Method not allowed' });
};
