// Vercel/Netlify serverless example for Google Cloud Text-to-Speech
// Expects env GOOGLE_TTS_CREDENTIALS with Service Account JSON

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }
  try {
    const { text, voiceName = 'pl-PL-Wavenet-D', speakingRate = 1.0 } = req.body || {};
    if (!text) {
      res.status(400).json({ error: 'Missing text' });
      return;
    }
    // Allow using a Google API key (passed via header or env) OR service account.
    const googleApiKey = req.headers['x-google-api-key'] || process.env.GOOGLE_API_KEY || process.env.GOOGLE_TTS_API_KEY;
    let ttsRes;
    if (googleApiKey) {
      // Use API key auth (no OAuth flow)
      ttsRes = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(googleApiKey)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: { text },
          voice: { languageCode: voiceName.split('-').slice(0,2).join('-'), name: voiceName, ssmlGender: 'MALE' },
          audioConfig: { audioEncoding: 'MP3', speakingRate },
        }),
      });
    } else {
      // Fallback to Service Account OAuth (existing behavior)
      const credsRaw = process.env.GOOGLE_TTS_CREDENTIALS;
      if (!credsRaw) {
        res.status(500).json({ error: 'Missing GOOGLE_TTS_CREDENTIALS or GOOGLE_TTS_API_KEY' });
        return;
      }
      const creds = JSON.parse(credsRaw);

      // Get OAuth2 access token using service account
      const jwtHeader = { alg: 'RS256', typ: 'JWT' };
      const now = Math.floor(Date.now() / 1000);
      const jwtClaim = {
        iss: creds.client_email,
        scope: 'https://www.googleapis.com/auth/cloud-platform',
        aud: 'https://oauth2.googleapis.com/token',
        iat: now,
        exp: now + 3600,
      };
      const base64url = (str) => Buffer.from(str).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
      const crypto = await import('node:crypto');
      const encodedHeader = base64url(JSON.stringify(jwtHeader));
      const encodedClaim = base64url(JSON.stringify(jwtClaim));
      const toSign = `${encodedHeader}.${encodedClaim}`;
      const signer = crypto.createSign('RSA-SHA256');
      signer.update(toSign);
      const signature = signer.sign(creds.private_key, 'base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
      const assertion = `${toSign}.${signature}`;

      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
          assertion,
        }),
      });
      if (!tokenRes.ok) {
        const t = await tokenRes.text();
        res.status(500).json({ error: 'Auth error', details: t });
        return;
      }
      const { access_token } = await tokenRes.json();

      ttsRes = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify({
          input: { text },
          voice: { languageCode: voiceName.split('-').slice(0,2).join('-'), name: voiceName, ssmlGender: 'MALE' },
          audioConfig: { audioEncoding: 'MP3', speakingRate },
        }),
      });
    }
    if (!ttsRes.ok) {
      const t = await ttsRes.text();
      res.status(500).json({ error: 'TTS error', details: t });
      return;
    }
    const json = await ttsRes.json();
    res.status(200).json(json); // { audioContent }
  } catch (e) {
    res.status(500).json({ error: 'Unexpected error', message: e?.message });
  }
}
