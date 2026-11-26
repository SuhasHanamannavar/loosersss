const fs = require('fs');
const path = require('path');

module.exports = function handler(req, res) {
  try {
    const scriptPath = path.join(process.cwd(), 'activate.ps1');
    let content = fs.readFileSync(scriptPath, 'utf8');
    if (content.charCodeAt(0) === 0xFEFF) {
      content = content.slice(1);
    }
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.status(200).send(content);
  } catch (err) {
    res.status(500).send('# Failed to load Checkmate activator script: ' + err.message);
  }
};
