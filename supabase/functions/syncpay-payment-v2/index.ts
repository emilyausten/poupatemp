import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Credenciais da SyncPay V2
const CLIENT_ID = "7a7ef813-bf52-4b40-b452-b57a2f89e766";
const CLIENT_SECRET = "406397e0-07e3-46dc-b0ce-2cb658fb6dac";
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
    
    // Health check da API SyncPay
    try {
      const healthResponse = await fetch('https://api.syncpayments.com.br/health', {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 segundos timeout
      });
      console.log('🏥 Health check SyncPay:', healthResponse.status);
    } catch (healthError) {
      console.warn('⚠️ Health check falhou, mas continuando:', healthError);
    }

    // Recebe o payload do frontend
    const payload = await req.json();
    console.log('📦 Payload recebido:', JSON.stringify(payload, null, 2));
    console.log('🔍 expiresInDays recebido:', payload.pix?.expiresInDays, 'tipo:', typeof payload.pix?.expiresInDays);
    
    // Validação básica do payload
    if (!payload.customer?.cpf || payload.customer.cpf.length !== 11) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'CPF inválido - deve ter 11 dígitos'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    if (!payload.customer?.address?.zipCode || payload.customer.address.zipCode.length < 8) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'CEP inválido - deve ter pelo menos 8 dígitos'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    if (!payload.amount || payload.amount < 1.49) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Valor mínimo para PIX é R$ 1,49'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Validação específica do expiresInDays
    if (!payload.pix?.expiresInDays || typeof payload.pix.expiresInDays !== 'string') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'expiresInDays deve ser uma string com data (ex: "2024-12-31")'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // 1. Autenticar com Client ID, Secret e chave adicional para obter token
    console.log('🔑 Autenticando com SyncPay V2...');
    console.log('🔑 CLIENT_ID:', CLIENT_ID);
    console.log('🔑 CLIENT_SECRET:', CLIENT_SECRET.substring(0, 10) + '...');
    console.log('🔑 ADDITIONAL_KEY:', ADDITIONAL_KEY);
    console.log('🔑 AUTH_URL:', AUTH_URL);
    
    // Função para fazer requisição com retry
    const makeRequestWithRetry = async (url: string, options: any, maxRetries = 3) => {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`🔄 Tentativa ${attempt}/${maxRetries} para ${url}`);
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos timeout
          
          const response = await fetch(url, {
            ...options,
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          return response;
        } catch (error) {
          console.error(`❌ Tentativa ${attempt} falhou:`, error);
          if (attempt === maxRetries) throw error;
          
          // Aguardar antes da próxima tentativa (backoff exponencial)
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`⏳ Aguardando ${delay}ms antes da próxima tentativa...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    };
    
    const authPayload = {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      [ADDITIONAL_KEY]: "01K1259MAXE0TNRXV2C2WQN2MV" // Valor adicional obrigatório
    };
    
    console.log('🔑 Payload de autenticação:', JSON.stringify(authPayload, null, 2));
    
    const authResponse = await makeRequestWithRetry(AUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(authPayload)
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
    const gatewayResponse = await makeRequestWithRetry(GATEWAY_URL, {
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
      console.error('❌ Erro na API Gateway V2:', gatewayResponse.status, gatewayData);
      
      // Tentar fallback para API V1
      console.log('🔄 Tentando fallback para API V1...');
      try {
        const v1Response = await makeRequestWithRetry('https://api.syncpayments.com.br/api/v1/pix', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${btoa(CLIENT_ID + ':' + CLIENT_SECRET)}`
          },
          body: JSON.stringify({
            ...payload,
            amount: payload.amount,
            customer: {
              ...payload.customer,
              document: {
                number: payload.customer.cpf,
                type: 'cpf'
              }
            }
          })
        });
        
        if (v1Response.ok) {
          const v1Data = await v1Response.json();
          console.log('✅ Fallback V1 bem-sucedido:', v1Data);
          
          return new Response(
            JSON.stringify({
              success: true,
              data: {
                idTransaction: v1Data.idTransaction || v1Data.id,
                paymentCode: v1Data.paymentCode,
                paymentCodeBase64: v1Data.paymentCodeBase64,
                status_transaction: v1Data.status_transaction || 'pending',
                message: 'PIX gerado via fallback V1'
              }
            }),
            { 
              status: 200, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
      } catch (fallbackError) {
        console.error('❌ Fallback V1 também falhou:', fallbackError);
      }
      
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
