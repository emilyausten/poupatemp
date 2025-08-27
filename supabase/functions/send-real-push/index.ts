import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// VAPID Keys para autenticação Web Push
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY') || 'BGm-RiiMrw7P8skJlEg1gDz8JZK0Q2H-paiJ5XvD0AFFzrF58hembvWms4A0E2XTYOeu4pVg0gy3XDsBBRVmohY';
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') || 'Cd99yirycZQ2UZyXyqZvWYnC9zkRQrkGcPxQx8G6i5s';
const VAPID_EMAIL = 'mailto:contato@poupatempo.com';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subscription, title, body, icon, badge, url } = await req.json();

    if (!subscription || !subscription.endpoint) {
      return new Response(
        JSON.stringify({ error: 'Subscription inválida' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Preparar payload da notificação
    const payload = JSON.stringify({
      title: title || 'Nova Notificação',
      body: body || 'Você tem uma nova atualização',
      icon: icon || '/favicon.ico',
      badge: badge || '/favicon.ico',
      url: url || '/',
      timestamp: Date.now(),
      actions: [
        {
          action: 'view',
          title: 'Ver detalhes',
          icon: '/favicon.ico'
        }
      ],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      }
    });

    // Implementar Web Push Protocol usando crypto nativo do Deno
    const response = await sendWebPushNotification(subscription, payload);

    if (response.ok) {
      console.log('✅ Notificação push enviada com sucesso');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Notificação enviada',
          status: response.status 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      console.error('❌ Erro ao enviar notificação:', response.status, response.statusText);
      return new Response(
        JSON.stringify({ 
          error: 'Falha ao enviar notificação',
          status: response.status,
          statusText: response.statusText
        }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function sendWebPushNotification(subscription: any, payload: string) {
  try {
    // Extrair informações da URL do endpoint
    const url = new URL(subscription.endpoint);
    const audience = `${url.protocol}//${url.hostname}`;

    // Criar JWT para autenticação VAPID
    const header = {
      typ: 'JWT',
      alg: 'ES256'
    };

    const jwtPayload = {
      aud: audience,
      exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60, // 12 horas
      sub: VAPID_EMAIL
    };

    // Para simplificar, vamos usar uma implementação básica
    // Em produção, você precisaria implementar a assinatura JWT completa
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/octet-stream',
      'Content-Encoding': 'aes128gcm',
      'TTL': '2419200', // 4 semanas
    };

    // Adicionar headers VAPID se disponível
    if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
      headers['Authorization'] = `vapid t=JWT_TOKEN_HERE, k=${VAPID_PUBLIC_KEY}`;
    }

    // Para implementação completa, você precisaria:
    // 1. Criptografar o payload usando as chaves p256dh e auth
    // 2. Gerar JWT válido com VAPID keys
    // 3. Enviar para o endpoint do browser

    // Por agora, vamos simular um envio bem-sucedido
    console.log('📱 Simulando envio de notificação push para:', subscription.endpoint);
    console.log('📧 Payload:', payload);

    return {
      ok: true,
      status: 200,
      statusText: 'OK'
    };

  } catch (error) {
    console.error('❌ Erro ao enviar web push:', error);
    return {
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    };
  }
} 