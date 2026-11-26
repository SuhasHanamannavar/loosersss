const { DynamoDBClient, ScanCommand, PutItemCommand, DeleteItemCommand } = require('@aws-sdk/client-dynamodb');

const REGION = process.env.AWS_REGION || 'us-east-1';
const ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'kin-data';

let dynamoClient = null;
function getClient() {
  if (!dynamoClient && ACCESS_KEY_ID && SECRET_ACCESS_KEY) {
    dynamoClient = new DynamoDBClient({
      region: REGION,
      credentials: {
        accessKeyId: ACCESS_KEY_ID,
        secretAccessKey: SECRET_ACCESS_KEY
      }
    });
  }
  return dynamoClient;
}

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
        TableName: TABLE_NAME,
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
          const data = JSON.parse(item.data.S);
          if (pk === 'CHECKMATE#ACTOR') actors.push(data);
          else if (pk === 'CHECKMATE#ASSET') assets.push(data);
          else if (pk === 'CHECKMATE#REVOKED') registry.push(data);
          else if (pk === 'CHECKMATE#AUDIT') audit.push(data);
          else if (pk === 'CHECKMATE#KEY') keys.push(data);
        } catch (e) {}
      });

      registry.sort((a, b) => (b.ts || '').localeCompare(a.ts || ''));
      audit.sort((a, b) => (b.ts || '').localeCompare(a.ts || ''));

      return res.status(200).json({
        ok: true,
        connected: true,
        aws: { region: REGION, table: TABLE_NAME },
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
          TableName: TABLE_NAME,
          FilterExpression: 'begins_with(PK, :prefix)',
          ExpressionAttributeValues: { ':prefix': { S: 'CHECKMATE#' } }
        });
        const scanRes = await client.send(scanCmd);
        for (const item of (scanRes.Items || [])) {
          await client.send(new DeleteItemCommand({
            TableName: TABLE_NAME,
            Key: { PK: item.PK, SK: item.SK }
          }));
        }
        return res.status(200).json({ ok: true, cleared: true });
      }

      if (pk && sk) {
        const putCmd = new PutItemCommand({
          TableName: TABLE_NAME,
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
