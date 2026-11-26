const { GetItemCommand } = require('@aws-sdk/client-dynamodb');
const { getClient, REGION, AUTH_TABLE } = require('./_db');

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const action = body.action || req.query?.action || 'me';

    if (req.method === 'GET' || action === 'me') {
      const authHeader = req.headers.authorization || '';
      if (!authHeader.startsWith('Bearer ')) {
        return res.status(200).json({
          authenticated: false,
          user: null,
          aws: { region: REGION, connected: true }
        });
      }
      const token = authHeader.replace('Bearer ', '').trim();
      const parts = Buffer.from(token, 'base64').toString('utf8').split(':');
      const email = parts[0];
      return res.status(200).json({
        authenticated: true,
        user: { email, name: email === 'webofjee@gmail.com' ? 'Suhas Hanamannavar' : email.split('@')[0], role: 'admin' },
        aws: { region: REGION, connected: true }
      });
    }

    if (action === 'login') {
      const email = (body.email || '').trim().toLowerCase();
      const password = (body.password || '').trim();

      if (!email || !password) {
        return res.status(400).json({ ok: false, error: 'Email and password are required' });
      }

      // Check AWS DynamoDB users table if client available
      try {
        const client = getClient();
        if (client) {
          const cmd = new GetItemCommand({
            TableName: AUTH_TABLE,
            Key: { email: { S: email } }
          });
          const result = await client.send(cmd);
          if (result.Item && result.Item.password && result.Item.password.S === password) {
            const user = {
              email: result.Item.email.S,
              name: result.Item.name ? result.Item.name.S : email.split('@')[0],
              role: result.Item.role ? result.Item.role.S : 'admin'
            };
            const token = Buffer.from(`${email}:${Date.now()}`).toString('base64');
            return res.status(200).json({ ok: true, token, user, source: 'AWS DynamoDB' });
          }
        }
      } catch (dbErr) {
        console.error('DynamoDB auth check error:', dbErr);
      }

      // Fallback admin check if table item not yet provisioned
      if (email === 'webofjee@gmail.com' && password === 'Suhas@2007') {
        const user = { email, name: 'Suhas Hanamannavar', role: 'admin' };
        const token = Buffer.from(`${email}:${Date.now()}`).toString('base64');
        return res.status(200).json({ ok: true, token, user, source: 'AWS Admin' });
      }

      return res.status(401).json({ ok: false, error: 'Invalid email or password' });
    }

    return res.status(400).json({ ok: false, error: 'Unknown action' });
  } catch (err) {
    console.error('Auth handler error:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
};
