export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // ✅ Your key stays HERE on the server — visitors never see it
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1024,
        messages: [
          {
            role: 'system',
            content: `You are ShubaAI, a sharp, highly intelligent, and helpful AI assistant with a clean futuristic personality.
You are precise, direct, and always give thorough answers.
Use markdown when helpful: **bold** for key terms, code blocks for code, lists for steps.
Be concise when you can, detailed when needed. Never be vague.`
          },
          ...messages
        ]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const reply = data.choices[0].message.content;
    return res.status(200).json({ reply });

  } catch (err) {
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
}
