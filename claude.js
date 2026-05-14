export default async function handler(req, res) {
  // Só aceita POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Chave da API — definida como variável de ambiente na Vercel (nunca no código)
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY não configurada' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':         'application/json',
        'x-api-key':            apiKey,
        'anthropic-version':    '2023-06-01',
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();

    // Repassa status e corpo exatamente como veio da Anthropic
    return res.status(response.status).json(data);

  } catch (err) {
    console.error('Proxy Claude error:', err);
    return res.status(500).json({ error: 'Erro interno no proxy' });
  }
}
