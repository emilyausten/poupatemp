import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get the API key from Supabase secrets
    const CASHTIME_API_KEY = Deno.env.get('CASHTIME_API_KEY')
    
    console.log('🔑 CASHTIME_API_KEY disponível?', !!CASHTIME_API_KEY)
    if (CASHTIME_API_KEY) {
      console.log('🔑 Primeiros 20 caracteres:', CASHTIME_API_KEY.substring(0, 20))
      console.log('🔑 Últimos 4 caracteres:', CASHTIME_API_KEY.slice(-4))
      console.log('🔑 Comprimento total:', CASHTIME_API_KEY.length)
    }
    
    if (!CASHTIME_API_KEY) {
      throw new Error('CASHTIME_API_KEY not configured in Supabase secrets')
    }

    return new Response(
      JSON.stringify({ 
        CASHTIME_API_KEY,
        success: true 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})