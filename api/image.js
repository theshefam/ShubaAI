export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'No prompt provided' });

  const HF_KEY = process.env.HF_API_KEY;
  if (!HF_KEY) return res.status(500).json({ error: 'HF_API_KEY not set in Vercel' });

  const models = [
    'black-forest-labs/FLUX.1-schnell',
    'stabilityai/stable-diffusion-xl-base-1.0',
    'runwayml/stable-diffusion-v1-5'
  ];

  for (const model of models) {
    try {
      const response = await fetch(
        `https://router.huggingface.co/hf-inference/models/${model}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${HF_KEY}`
          },
          body: JSON.stringify({ inputs: prompt }),
          signal: AbortSignal.timeout(30000)
        }
      );

      if (response.ok) {
        const buffer = await response.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        return res.status(200).json({ image: base64 });
      }

      if (response.status === 503) continue; // model loading, try next

      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP ${response.status}`);

    } catch (e) {
      if (model === models[models.length - 1]) {
        return res.status(500).json({ error: e.message || 'Generation failed' });
      }
    }
  }

  return res.status(500).json({ error: 'All models busy. Try again.' });
}
