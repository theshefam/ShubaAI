export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { messages } = req.body;
  if (!messages) return res.status(400).json({ error: 'Invalid request' });
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1024,
        messages: [
          { role: 'system', content: 'You are ShubaAI, a sharp, highly intelligent, and helpful AI assistant with a futuristic personality. Be precise, direct, and thorough. Use markdown when helpful.' },
          ...messages
        ]
      })
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return res.status(200).json({ reply: data.choices[0].message.content });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
