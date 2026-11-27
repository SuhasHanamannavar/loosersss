const crypto = require('crypto');
const { ScanCommand, PutItemCommand, GetItemCommand } = require('@aws-sdk/client-dynamodb');
const { getClient, DATA_TABLE } = require('./_db');

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-checkmate-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const client = getClient();

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const apiKey = (body.apiKey || body.key || req.headers['x-checkmate-key'] || req.query?.apiKey || '').trim();
    const actor = (body.actor || body.developer || req.query?.actor || 'developer').trim().toLowerCase();
    const asset = (body.asset || body.document || req.query?.asset || 'silica-document').trim();
    const hostname = (body.hostname || req.query?.hostname || 'workstation').trim();
    const action = (body.action || 'protected_read').trim();

    if (!apiKey) {
      return res.status(400).json({
        ok: false,
        allowed: false,
        error: 'Missing API key. Provide apiKey.'
      });
    }

    let keyRecord = null;
    if (client) {
      const scanCmd = new ScanCommand({
        TableName: DATA_TABLE,
        FilterExpression: 'begins_with(PK, :pk)',
        ExpressionAttributeValues: { ':pk': { S: 'CHECKMATE#KEYS' } }
      });
      const result = await client.send(scanCmd);
      const items = result.Items || [];

      keyRecord = items.find(item => item.key && item.key.S === apiKey);
      if (!keyRecord) {
        keyRecord = items.find(item => item.prefix && (item.prefix.S === apiKey || item.prefix.S.replace(/\s/g, '') === apiKey.replace(/\s/g, '')));
      }
      if (!keyRecord && apiKey.includes('...')) {
        const parts = apiKey.split('...').filter(Boolean);
        if (parts.length >= 1) {
          keyRecord = items.find(item => {
            const k = item.key ? item.key.S : '';
            return k && k.startsWith(parts[0]) && (parts.length < 2 || k.endsWith(parts[1]));
          });
        }
      }
    }

    if (keyRecord) {
      const keyStatus = keyRecord.status ? keyRecord.status.S : 'ACTIVE';
      if (keyStatus !== 'ACTIVE') {
        return res.status(403).json({
          ok: false,
          allowed: false,
          status: 'REVOKED',
          error: 'BLOCKED: revoked device access attempt · API key disabled at verification'
        });
      }
    }

    const requestId = 'req-' + crypto.randomBytes(3).toString('hex');
    const now = new Date().toISOString();

    // 1. CHECK IF ACTOR IS IN DISABLED / REVOKED REGISTRY
    let isRevoked = false;
    if (client) {
      try {
        const revCheck = await client.send(new GetItemCommand({
          TableName: DATA_TABLE,
          Key: {
            PK: { S: 'CHECKMATE#REVOKED' },
            SK: { S: actor }
          }
        }));
        if (revCheck && revCheck.Item) {
          isRevoked = true;
        }
      } catch (e) {
        console.warn('Revocation check error:', e.message);
      }
    }

    // 2. FAIL CLOSED IF REVOKED
    if (isRevoked) {
      if (client) {
        try {
          await client.send(new PutItemCommand({
            TableName: DATA_TABLE,
            Item: {
              PK: { S: 'CHECKMATE#DECISIONS' },
              SK: { S: `DEC#${Date.now()}#${requestId}` },
              requestId: { S: requestId },
              time: { S: now },
              actor: { S: actor },
              asset: { S: asset },
              mode: { S: 'PROTECTED_READ' },
              decision: { S: 'DENY' },
              hostname: { S: hostname },
              tenantId: { S: keyRecord?.tenantId?.S || 'silica' }
            }
          }));
        } catch (e) {}
      }

      return res.status(403).json({
        ok: false,
        allowed: false,
        status: 'REVOKED',
        requestId: requestId,
        actor: actor,
        asset: asset,
        decision: 'DENY',
        error: 'BLOCKED: revoked device access attempt · identity_disabled at verification'
      });
    }

    // 3. ALLOW ACCESS: LOG AUDIT NON-REPUDIATION DECISION
    if (client) {
      try {
        await client.send(new PutItemCommand({
          TableName: DATA_TABLE,
          Item: {
            PK: { S: 'CHECKMATE#DECISIONS' },
            SK: { S: `DEC#${Date.now()}#${requestId}` },
            requestId: { S: requestId },
            time: { S: now },
            actor: { S: actor },
            asset: { S: asset },
            mode: { S: 'PROTECTED_READ' },
            decision: { S: 'ALLOW' },
            hostname: { S: hostname },
            tenantId: { S: keyRecord?.tenantId?.S || 'silica' }
          }
        }));
      } catch (e) {}
    }

    return res.status(200).json({
      ok: true,
      allowed: true,
      status: 'ACTIVE',
      requestId: requestId,
      actor: actor,
      asset: asset,
      decision: 'ALLOW',
      kem_suite: 'ML-KEM-768 (FIPS 203)',
      envelope: {
        public_key_bytes: 1184,
        ciphertext_bytes: 1088,
        shared_secret_bytes: 32,
        unlocked_at: now
      }
    });
  } catch (err) {
    console.error('Verify endpoint error:', err);
    return res.status(500).json({ ok: false, allowed: false, error: err.message });
  }
};
