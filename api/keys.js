const crypto = require('crypto');
const { ScanCommand, PutItemCommand, UpdateItemCommand, DeleteItemCommand } = require('@aws-sdk/client-dynamodb');
const { getClient, DATA_TABLE, MASTER_PROMPT } = require('./_db');

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const client = getClient();
  const origin = req.headers.host ? `https://${req.headers.host}` : 'https://checkmateee.vercel.app';

  try {
    // ---------------- LIST KEYS ----------------
    if (req.method === 'GET') {
      if (!client) {
        return res.status(200).json({ ok: true, keys: [] });
      }

      const scanCmd = new ScanCommand({
        TableName: DATA_TABLE,
        FilterExpression: 'begins_with(PK, :pk)',
        ExpressionAttributeValues: {
          ':pk': { S: 'CHECKMATE#KEYS' }
        }
      });
      const result = await client.send(scanCmd);
      const keys = (result.Items || []).map(item => ({
        id: item.SK.S.replace('KEY#', ''),
        name: item.name ? item.name.S : 'API Key',
        apiKey: item.key ? item.key.S : '',
        prefix: item.prefix ? item.prefix.S : (item.key ? item.key.S.substring(0, 10) + '...' : 'ck_live_***'),
        status: item.status ? item.status.S : 'ACTIVE',
        scopes: item.scopes ? JSON.parse(item.scopes.S) : ['read', 'protected_read', 'workspace_activation'],
        created_at: item.created_at ? item.created_at.S : new Date().toISOString(),
        last_used: item.last_used ? item.last_used.S : 'never',
        tenantId: item.tenantId ? item.tenantId.S : 'default-tenant'
      }));

      return res.status(200).json({ ok: true, keys });
    }

    // ---------------- CREATE OR REVOKE KEY ----------------
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const action = body.action || 'create';

      if (action === 'revoke') {
        const keyId = body.id || body.keyId;
        if (!keyId) {
          return res.status(400).json({ ok: false, error: 'Key ID is required to revoke' });
        }
        if (client) {
          const updateCmd = new UpdateItemCommand({
            TableName: DATA_TABLE,
            Key: {
              PK: { S: 'CHECKMATE#KEYS' },
              SK: { S: `KEY#${keyId}` }
            },
            UpdateExpression: 'SET #st = :rev, revoked_at = :now',
            ExpressionAttributeNames: { '#st': 'status' },
            ExpressionAttributeValues: {
              ':rev': { S: 'REVOKED' },
              ':now': { S: new Date().toISOString() }
            }
          });
          await client.send(updateCmd);
        }
        return res.status(200).json({ ok: true, id: keyId, status: 'REVOKED' });
      }

      // Generate a new secure API Key
      const keyName = (body.name || 'Developer Workspace Key').trim();
      const envType = body.env || 'live';
      const tenantId = (body.tenantId || 'acme-corp').trim().toLowerCase();
      const rawSecret = crypto.randomBytes(24).toString('hex');
      const apiKey = `ck_${envType}_${rawSecret}`;
      const prefix = `ck_${envType}_${rawSecret.substring(0, 4)}...${rawSecret.substring(rawSecret.length - 4)}`;
      const keyId = crypto.randomUUID().split('-')[0];
      const now = new Date().toISOString();
      const scopes = body.scopes || ['read', 'guard', 'protected_read', 'workspace_activation'];

      if (client) {
        const putCmd = new PutItemCommand({
          TableName: DATA_TABLE,
          Item: {
            PK: { S: 'CHECKMATE#KEYS' },
            SK: { S: `KEY#${keyId}` },
            key: { S: apiKey },
            id: { S: keyId },
            name: { S: keyName },
            prefix: { S: prefix },
            status: { S: 'ACTIVE' },
            tenantId: { S: tenantId },
            scopes: { S: JSON.stringify(scopes) },
            created_at: { S: now },
            last_used: { S: 'never' }
          }
        });
        await client.send(putCmd);
      }

      const powershellCommand = `$env:CHECKMATE_API_KEY="${apiKey}"; irm ${origin}/api/activate.ps1 | iex`;

      return res.status(200).json({
        ok: true,
        key: {
          id: keyId,
          name: keyName,
          apiKey: apiKey,
          prefix: prefix,
          status: 'ACTIVE',
          tenantId: tenantId,
          created_at: now,
          scopes: scopes
        },
        powershell_activation: powershellCommand,
        master_prompt: MASTER_PROMPT
      });
    }

    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  } catch (err) {
    console.error('Keys API error:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
};
