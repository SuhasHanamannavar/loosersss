module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({
    status: 'ok',
    control_plane: 'connected',
    engine: 'ML-KEM-768',
    aws_region: process.env.AWS_REGION || 'us-east-1',
    database: 'DynamoDB'
  });
};
