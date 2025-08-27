import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔍 CheckTransactionStatus - Iniciando verificação...');
    
    // Recebe o ID da transação
    const { transactionId } = await req.json();
    
    if (!transactionId) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Transaction ID não fornecido'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('🔍 Verificando transação:', transactionId);

    // Credenciais da SyncPay V2
    const SYNCPAY_CLIENT_ID = '845a7f62-8e76-426d-b34e-c8a247d0f7cc';
    const SYNCPAY_CLIENT_SECRET = 'f09275db-1902-4dbd-bdb5-6ffe0267066c';
    const SYNCPAY_API_URL = 'https://api.syncpay.pro/v1/gateway/api/';

    // Autenticação Basic Auth
    const basicAuth = btoa(`${SYNCPAY_CLIENT_ID}:${SYNCPAY_CLIENT_SECRET}`);

    // Consulta o status da transação na SyncPay
    const response = await fetch(`${SYNCPAY_API_URL}/transaction/${transactionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${basicAuth}`
      }
    });

    if (!response.ok) {
      console.log('❌ Transação ainda não disponível ou erro:', response.status);
      return new Response(
        JSON.stringify({ 
          success: false,
          status: 'pending',
          message: 'Transação ainda não disponível'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const data = await response.json();
    console.log('✅ Dados da transação:', data);

    // Verifica se tem os dados do PIX
    if (data.pix_code && data.qr_code_base64) {
      return new Response(
        JSON.stringify({
          success: true,
          status: 'completed',
          pix_code: data.pix_code,
          pix_qr_code: data.pix_qr_code,
          qr_code_base64: data.qr_code_base64,
          transaction_id: transactionId
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } else {
      return new Response(
        JSON.stringify({ 
          success: false,
          status: 'pending',
          message: 'PIX ainda não gerado'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

  } catch (error) {
    console.error('❌ Erro ao verificar transação:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Erro interno do servidor',
        details: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
