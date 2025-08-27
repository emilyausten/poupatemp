import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Credenciais da SyncPay V2
const CLIENT_ID = "ade6e47f-ba98-4cef-a56a-4c6ea93b8673";
const CLIENT_SECRET = "f43f219b-3de1-4e10-8b5b-411cd1092e5c";
const ADDITIONAL_KEY = "01K1259MAXE0TNRXV2C2WQN2MV"; // Valor adicional obrigatório
const AUTH_URL = "https://api.syncpayments.com.br/api/partner/v1/auth-token";
const GATEWAY_URL = "https://api.syncpayments.com.br/v1/gateway/api";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔔 SyncPay V2 - Iniciando processamento...');
    console.log('🔍 Método da requisição:', req.method);
    console.log('🔍 URL da requisição:', req.url);

    // Recebe o payload do frontend
    const payload = await req.json();
    console.log('📦 Payload recebido:', JSON.stringify(payload, null, 2));

    // 1. Autenticar com Client ID, Secret e chave adicional para obter token
    console.log('🔑 Autenticando com SyncPay V2...');
    const authResponse = await fetch(AUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        [ADDITIONAL_KEY]: "valor fornecido pela SyncPay" // Valor adicional obrigatório
      })
    });

    if (!authResponse.ok) {
      console.error('❌ Erro na autenticação:', authResponse.status, await authResponse.text());
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Erro na autenticação com SyncPay V2',
          status: authResponse.status
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const authData = await authResponse.json();
    console.log('✅ Autenticação bem-sucedida:', authData);

    const accessToken = authData.access_token;
    if (!accessToken) {
      console.error('❌ Token não encontrado na resposta de autenticação');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Token de acesso não encontrado'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // 2. Enviar payload para gerar transação PIX
    console.log('🌐 Enviando payload para gerar transação PIX...');
    const gatewayResponse = await fetch(GATEWAY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(payload)
    });

    console.log('📥 Status da resposta Gateway:', gatewayResponse.status);
    console.log('📥 Headers da resposta Gateway:', Object.fromEntries(gatewayResponse.headers.entries()));

    const responseText = await gatewayResponse.text();
    console.log('📥 Resposta Gateway (texto):', responseText);

    let gatewayData;
    try {
      gatewayData = JSON.parse(responseText);
      console.log('📥 Resposta Gateway (JSON):', JSON.stringify(gatewayData, null, 2));
    } catch (parseError) {
      console.error('❌ Erro ao fazer parse da resposta Gateway:', parseError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Resposta inválida da API Gateway',
          details: responseText
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // 3. Verificar erros de autenticação ou validação
    if (gatewayResponse.status === 401) {
      console.error('❌ Erro 401 - Token inválido ou expirado');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Token inválido ou expirado',
          details: gatewayData
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (gatewayResponse.status === 400) {
      console.error('❌ Erro 400 - Payload inválido:', gatewayData);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Payload inválido',
          details: gatewayData
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!gatewayResponse.ok) {
      console.error('❌ Erro na API Gateway:', gatewayResponse.status, gatewayData);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Erro na API Gateway: ${gatewayResponse.status}`,
          details: gatewayData
        }),
        { 
          status: gatewayResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // 4. Extrair campos paymentCode e paymentCodeBase64
    const paymentCode = gatewayData.paymentCode || gatewayData.pix_code || gatewayData.pixCode;
    const paymentCodeBase64 = gatewayData.paymentCodeBase64 || gatewayData.qr_code_base64 || gatewayData.qrCodeBase64;
    const idTransaction = gatewayData.idTransaction || gatewayData.id || gatewayData.client_id || gatewayData.transaction_id;

    console.log('🔍 Campos extraídos:');
    console.log('  - paymentCode:', paymentCode ? 'Encontrado' : 'Não encontrado');
    console.log('  - paymentCodeBase64:', paymentCodeBase64 ? 'Encontrado' : 'Não encontrado');
    console.log('  - idTransaction:', idTransaction);

    // 5. Verificar se os campos essenciais estão presentes
    if (!paymentCode || !paymentCodeBase64) {
      console.error('❌ Campos essenciais não encontrados na resposta');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Campos paymentCode ou paymentCodeBase64 não encontrados',
          details: gatewayData
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // 6. Retornar objeto final para o frontend
    const finalResponse = {
      success: true,
      data: {
        idTransaction: idTransaction,
        paymentCode: paymentCode,
        paymentCodeBase64: paymentCodeBase64,
        status_transaction: gatewayData.status_transaction || gatewayData.status || 'WAITING_FOR_APPROVAL',
        message: gatewayData.message || 'PIX gerado com sucesso'
      }
    };

    console.log('✅ Resposta final para o frontend:', JSON.stringify(finalResponse, null, 2));

    return new Response(
      JSON.stringify(finalResponse),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Erro geral na Edge Function:', error);
    console.error('❌ Stack trace:', error.stack);
    
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
