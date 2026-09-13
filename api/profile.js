const fs = require('fs');
const path = require('path');

module.exports = function handler(req, res) {
  try {
    const file = path.join(process.cwd(), 'assets', 'abdullah-profile-original.webp.b64.txt');
    const base64 = fs.readFileSync(file, 'utf8').trim();
    const image = Buffer.from(base64, 'base64');
    res.setHeader('Content-Type', 'image/webp');
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=31536000, stale-while-revalidate=86400');
    res.status(200).send(image);
  } catch (error) {
    res.status(404).end();
  }
};
