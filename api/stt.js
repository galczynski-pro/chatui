// Serverless endpoint for Google Cloud Speech-to-Text (recognize)
// Prefers env GOOGLE_API_KEY; also accepts header x-google-api-key

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }
  try {
    const { audioBase64, contentType = 'audio/ogg;codecs=opus', languageCode = 'pl-PL' } = req.body || {};
    if (!audioBase64) {
      res.status(400).json({ error: 'Missing audioBase64' });
      return;
    }

    const apiKey = req.headers['x-google-api-key'] || process.env.GOOGLE_API_KEY || process.env.GOOGLE_SPEECH_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: 'Missing GOOGLE_API_KEY' });
      return;
    }

    // Map contentType to STT encoding
    let encoding = undefined;
    if (String(contentType).includes('ogg')) encoding = 'OGG_OPUS';
    else if (String(contentType).includes('wav')) encoding = 'LINEAR16';
    else if (String(contentType).includes('flac')) encoding = 'FLAC';

    if (!encoding) {
      res.status(400).json({ error: 'Unsupported contentType', details: 'Use audio/ogg;codecs=opus or audio/wav (LINEAR16)' });
      return;
    }

    const body = {
      config: {
        encoding,
        languageCode,
        enableAutomaticPunctuation: true,
        model: 'latest_long',
      },
      audio: { content: audioBase64 },
    };

    const sttRes = await fetch(`https://speech.googleapis.com/v1/speech:recognize?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!sttRes.ok) {
      const t = await sttRes.text();
      res.status(500).json({ error: 'STT error', details: t });
      return;
    }
    const json = await sttRes.json();
    const transcript = (json.results && json.results[0] && json.results[0].alternatives && json.results[0].alternatives[0] && json.results[0].alternatives[0].transcript) || '';
    res.status(200).json({ transcript, raw: json });
  } catch (e) {
    res.status(500).json({ error: 'Unexpected error', message: e?.message });
  }
}

