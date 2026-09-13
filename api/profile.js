import fs from 'node:fs';
import path from 'node:path';

export default function handler(req, res) {
  try {
    const file = path.join(process.cwd(), 'assets', 'abdullah-profile-original.webp.b64.txt');
    const base64 = fs.readFileSync(file, 'utf8').trim();
    const image = Buffer.from(base64, 'base64');
    res.setHeader('Content-Type', 'image/webp');
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=31536000, stale-while-revalidate=86400');
    return res.status(200).send(image);
  } catch (error) {
    console.error('Portrait asset unavailable', error);
    return res.status(404).end();
  }
}
