import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { prompt, nomeAluno } = body

    console.log('Análise ficha — aluno:', nomeAluno)

    const ANTHROPIC_KEY = Deno.env.get('ANTHROPIC_API_KEY')
    console.log('Chave presente:', !!ANTHROPIC_KEY)

    if (!ANTHROPIC_KEY) {
      return new Response(
        JSON.stringify({ error: 'Chave ANTHROPIC_API_KEY não encontrada nos secrets.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    console.log('Status Anthropic:', response.status)
    const data = await response.json()
    console.log('Resposta Anthropic:', JSON.stringify(data).slice(0, 200))

    const texto = data?.content?.[0]?.text || data?.error?.message || 'Resposta inesperada da API.'

    return new Response(
      JSON.stringify({ texto }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('Erro na função:', err.message)
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
