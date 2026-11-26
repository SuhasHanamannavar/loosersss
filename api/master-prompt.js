const { MASTER_PROMPT } = require('./_db');

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const format = req.query.format || (req.headers.accept && req.headers.accept.includes('application/json') ? 'json' : 'text');

  if (format === 'json') {
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({
      ok: true,
      version: '2.4',
      name: 'Checkmate Zero-Trust Post-Quantum Master Prompt',
      prompt: MASTER_PROMPT
    });
  }

  res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
  return res.status(200).send(MASTER_PROMPT);
};
