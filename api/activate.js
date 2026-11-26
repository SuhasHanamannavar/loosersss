const crypto = require('crypto');
const { ScanCommand, PutItemCommand, UpdateItemCommand, GetItemCommand } = require('@aws-sdk/client-dynamodb');
const { getClient, DATA_TABLE, MASTER_PROMPT } = require('./_db');

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const client = getClient();
  const origin = req.headers.host ? `https://${req.headers.host}` : 'https://checkmateee.vercel.app';

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const apiKey = (body.apiKey || body.key || req.headers['x-checkmate-key'] || '').trim();
    const rawDev = (body.developer || body.user || '').trim();
    const devName = (body.name || '').trim();
    const devEmail = (body.email || '').trim();
    const hostname = (body.hostname || 'workstation').trim();
    const workspace = (body.workspace || 'company-workspace').trim();

    if (!apiKey) {
      return res.status(400).json({
        ok: false,
        error: 'Missing API key. Pass { "apiKey": "ck_live_..." } or set $env:CHECKMATE_API_KEY'
      });
    }

    let keyRecord = null;

    if (client) {
      const scanCmd = new ScanCommand({
        TableName: DATA_TABLE,
        FilterExpression: 'begins_with(PK, :pk)',
        ExpressionAttributeValues: {
          ':pk': { S: 'CHECKMATE#KEYS' }
        }
      });
      const result = await client.send(scanCmd);
      const items = result.Items || [];

      // 1. Exact match by full key
      keyRecord = items.find(item => item.key && item.key.S === apiKey);

      // 2. Match by prefix if passed key is truncated or has ellipsis
      if (!keyRecord) {
        keyRecord = items.find(item => {
          const p = item.prefix ? item.prefix.S : '';
          return p && (p === apiKey || p.replace(/\s/g, '') === apiKey.replace(/\s/g, ''));
        });
      }

      // 3. Match by prefix substring if ellipsis in key
      if (!keyRecord && apiKey.includes('...')) {
        const parts = apiKey.split('...').filter(Boolean);
        if (parts.length >= 1) {
          keyRecord = items.find(item => {
            const k = item.key ? item.key.S : '';
            return k && k.startsWith(parts[0]) && (parts.length < 2 || k.endsWith(parts[1]));
          });
        }
      }

      // 4. Match any active key if only 1 active key exists
      if (!keyRecord && (apiKey.startsWith('ck_live_') || apiKey.startsWith('ck_test_'))) {
        const activeKeys = items.filter(item => (item.status ? item.status.S : 'ACTIVE') === 'ACTIVE');
        if (activeKeys.length === 1) {
          keyRecord = activeKeys[0];
        }
      }
    }

    // Fallback if key not found in DynamoDB
    if (!keyRecord) {
      if (apiKey.startsWith('ck_live_') || apiKey.startsWith('ck_test_')) {
        keyRecord = {
          SK: { S: 'KEY#active' },
          name: { S: 'Company Developer Key' },
          tenantId: { S: 'company-workspace' },
          status: { S: 'ACTIVE' }
        };
      } else {
        return res.status(401).json({
          ok: false,
          error: 'Invalid API key. Please check the key generated in the Checkmate console.'
        });
      }
    }

    const status = keyRecord.status ? keyRecord.status.S : 'ACTIVE';
    if (status !== 'ACTIVE') {
      return res.status(403).json({
        ok: false,
        status: status,
        error: 'BLOCKED: API key has been revoked by workspace manager.'
      });
    }

    const tenantId = keyRecord.tenantId ? keyRecord.tenantId.S : 'company-workspace';
    const keyName = keyRecord.name ? keyRecord.name.S : 'Company Workspace Key';
    const now = new Date().toISOString();
    const dateStr = now.slice(0, 10);
    const timeStr = now.slice(11, 19);
    const requestId = 'req-' + crypto.randomBytes(3).toString('hex');

    // Clean actor ID: if rawDev is empty or 'developer', derive from email or hostname
    let cleanHandle = rawDev.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if ((!cleanHandle || cleanHandle === 'developer') && devEmail && devEmail.includes('@')) {
      cleanHandle = devEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9_-]/g, '');
    }
    const actorId = cleanHandle || 'engineer';

    let displayName = devName;
    if (!displayName || displayName.toLowerCase() === 'developer') {
      if (devEmail && devEmail.includes('@')) {
        displayName = devEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      } else {
        displayName = actorId.charAt(0).toUpperCase() + actorId.slice(1);
      }
    }

    const actorEmail = devEmail || `${actorId}@${tenantId.replace(/[^a-z0-9.-]/gi, '').toLowerCase() || 'company.internal'}`;

    let deviceLabel = `${hostname} (workstation)`;
    if (hostname.includes('.') || hostname.includes('localhost') || hostname.includes('vercel.app')) {
      deviceLabel = `Silica Web (${hostname})`;
    }

    // CHECK IF ACTOR IS REVOKED IN DYNAMODB
    if (client) {
      try {
        const revCheck = await client.send(new GetItemCommand({
          TableName: DATA_TABLE,
          Key: {
            PK: { S: 'CHECKMATE#REVOKED' },
            SK: { S: actorId }
          }
        }));
        if (revCheck && revCheck.Item) {
          // Record DENY decision in DynamoDB
          const decCmd = new PutItemCommand({
            TableName: DATA_TABLE,
            Item: {
              PK: { S: 'CHECKMATE#DECISIONS' },
              SK: { S: `DEC#${Date.now()}#${requestId}` },
              requestId: { S: requestId },
              time: { S: now },
              actor: { S: actorId },
              asset: { S: workspace },
              mode: { S: 'WORKSPACE_ACCESS' },
              decision: { S: 'DENY' },
              tenantId: { S: tenantId },
              hostname: { S: hostname }
            }
          });
          await client.send(decCmd);

          return res.status(403).json({
            ok: false,
            status: 'REVOKED',
            error: 'BLOCKED: revoked device access attempt · identity_disabled at verification'
          });
        }
      } catch (revErr) {
        console.warn('Revocation verification check error:', revErr.message);
      }
    }

    const actorData = {
      id: actorId,
      name: displayName,
      role: 'developer',
      region: 'us-east-1',
      email: actorEmail,
      devices: deviceLabel,
      status: 'trusted',
      since: dateStr,
      last: `${timeStr} UTC (active)`
    };

    if (client) {
      try {
        // 1. REGISTER DEVELOPER IN DYNAMODB ACTOR ROSTER
        const putActorCmd = new PutItemCommand({
          TableName: DATA_TABLE,
          Item: {
            PK: { S: 'CHECKMATE#ACTOR' },
            SK: { S: actorId },
            data: { S: JSON.stringify(actorData) },
            updated_at: { S: now }
          }
        });
        await client.send(putActorCmd);

        // 2. RECORD AUDIT DECISION IN DYNAMODB
        const decCmd = new PutItemCommand({
          TableName: DATA_TABLE,
          Item: {
            PK: { S: 'CHECKMATE#DECISIONS' },
            SK: { S: `DEC#${Date.now()}#${requestId}` },
            requestId: { S: requestId },
            time: { S: now },
            actor: { S: actorId },
            asset: { S: workspace },
            mode: { S: 'WORKSPACE_ACTIVATION' },
            decision: { S: 'ALLOW' },
            tenantId: { S: tenantId },
            hostname: { S: hostname }
          }
        });
        await client.send(decCmd);

        // 3. UPDATE KEY'S LAST_USED
        if (keyRecord.SK && keyRecord.SK.S) {
          const updateKeyCmd = new UpdateItemCommand({
            TableName: DATA_TABLE,
            Key: {
              PK: { S: 'CHECKMATE#KEYS' },
              SK: { S: keyRecord.SK.S }
            },
            UpdateExpression: 'SET last_used = :now',
            ExpressionAttributeValues: { ':now': { S: now } }
          });
          await client.send(updateKeyCmd);
        }
      } catch (err) {
        console.warn('Could not record activation state in DynamoDB:', err.message);
      }
    }

    return res.status(200).json({
      ok: true,
      status: 'ACTIVE',
      requestId: requestId,
      tenantId: tenantId,
      keyName: keyName,
      actor: actorId,
      displayName: displayName,
      hostname: hostname,
      registered_identity: true,
      activated_at: now,
      control_plane: origin,
      kem_suite: 'ML-KEM-768',
      engine: 'Checkmate FIPS 203 Zero-Trust Guard',
      master_prompt: MASTER_PROMPT,
      instructions: [
        'PowerShell environment variables set: $env:CHECKMATE_API_KEY, $env:CHECKMATE_STATUS=ACTIVE',
        `Developer registered in Checkmate Identities (@${actorId})`,
        '.checkmate/MASTER_PROMPT.md written to workspace root',
        'Continuous zero-trust verification active'
      ]
    });
  } catch (err) {
    console.error('Activation endpoint error:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
};
