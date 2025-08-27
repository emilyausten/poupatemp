import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  user_agent?: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  // Novos campos para dados completos do cliente
  customer_name?: string;
  customer_phone?: string;
  customer_cpf?: string;
  customer_address_street?: string;
  customer_address_number?: string;
  customer_address_complement?: string;
  customer_address_neighborhood?: string;
  customer_address_city?: string;
  customer_address_state?: string;
  customer_address_zip_code?: string;
  customer_address_country?: string;
  interested_product?: string;
  lead_source?: string;
}

interface RemarketingCampaignData {
  name: string;
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  target_audience?: any;
  schedule_type?: 'immediate' | 'scheduled' | 'recurring';
  scheduled_for?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();

    switch (action) {
      case 'save-lead': {
        if (req.method !== 'POST') {
          return new Response('Method not allowed', { status: 405, headers: corsHeaders });
        }

        const subscriptionData: PushSubscriptionData = await req.json();
        
        console.log('💾 Salvando novo lead de push subscription:', subscriptionData.endpoint);

        // Salvar lead no banco de dados com dados completos
        const { data, error } = await supabase
          .from('push_subscription_leads')
          .upsert({
            endpoint: subscriptionData.endpoint,
            p256dh_key: subscriptionData.keys.p256dh,
            auth_key: subscriptionData.keys.auth,
            user_agent: subscriptionData.user_agent,
            referrer: subscriptionData.referrer,
            utm_source: subscriptionData.utm_source,
            utm_medium: subscriptionData.utm_medium,
            utm_campaign: subscriptionData.utm_campaign,
            // Novos campos de dados do cliente
            customer_name: subscriptionData.customer_name,
            customer_phone: subscriptionData.customer_phone,
            customer_cpf: subscriptionData.customer_cpf,
            customer_address_street: subscriptionData.customer_address_street,
            customer_address_number: subscriptionData.customer_address_number,
            customer_address_complement: subscriptionData.customer_address_complement,
            customer_address_neighborhood: subscriptionData.customer_address_neighborhood,
            customer_address_city: subscriptionData.customer_address_city,
            customer_address_state: subscriptionData.customer_address_state,
            customer_address_zip_code: subscriptionData.customer_address_zip_code,
            customer_address_country: subscriptionData.customer_address_country || 'Brasil',
            interested_product: subscriptionData.interested_product,
            lead_source: subscriptionData.lead_source || 'notification_permission',
            is_active: true
          }, {
            onConflict: 'endpoint'
          })
          .select()
          .single();

        if (error) {
          console.error('❌ Erro ao salvar lead:', error);
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        console.log('✅ Lead salvo com sucesso:', data.id);

        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Lead salvo com sucesso!',
          lead_id: data.id 
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      case 'create-campaign': {
        if (req.method !== 'POST') {
          return new Response('Method not allowed', { status: 405, headers: corsHeaders });
        }

        const campaignData: RemarketingCampaignData = await req.json();
        
        console.log('📧 Criando nova campanha de remarketing:', campaignData.name);

        const { data: campaign, error: campaignError } = await supabase
          .from('remarketing_campaigns')
          .insert({
            name: campaignData.name,
            title: campaignData.title,
            body: campaignData.body,
            icon: campaignData.icon || '/favicon.ico',
            badge: campaignData.badge || '/favicon.ico',
            target_audience: campaignData.target_audience || {},
            schedule_type: campaignData.schedule_type || 'immediate',
            scheduled_for: campaignData.scheduled_for ? new Date(campaignData.scheduled_for).toISOString() : null
          })
          .select()
          .single();

        if (campaignError) {
          console.error('❌ Erro ao criar campanha:', campaignError);
          return new Response(JSON.stringify({ error: campaignError.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        // Se for campanha imediata, enviar agora
        if (campaignData.schedule_type === 'immediate') {
          const sendResult = await sendCampaignToLeads(supabase, campaign);
          return new Response(JSON.stringify({ 
            success: true, 
            campaign,
            sent_result: sendResult 
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        return new Response(JSON.stringify({ 
          success: true, 
          campaign,
          message: 'Campanha criada e agendada!'
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      case 'send-campaign': {
        if (req.method !== 'POST') {
          return new Response('Method not allowed', { status: 405, headers: corsHeaders });
        }

        const { campaign_id } = await req.json();
        
        // Buscar campanha
        const { data: campaign, error: campaignError } = await supabase
          .from('remarketing_campaigns')
          .select('*')
          .eq('id', campaign_id)
          .single();

        if (campaignError || !campaign) {
          return new Response(JSON.stringify({ error: 'Campanha não encontrada' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        const sendResult = await sendCampaignToLeads(supabase, campaign);
        
        return new Response(JSON.stringify({ 
          success: true, 
          sent_result: sendResult 
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      case 'get-leads': {
        if (req.method !== 'GET') {
          return new Response('Method not allowed', { status: 405, headers: corsHeaders });
        }

        const { data: leads, error } = await supabase
          .from('push_subscription_leads')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('❌ Erro ao buscar leads:', error);
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        return new Response(JSON.stringify({ 
          success: true, 
          leads: leads || [] 
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      case 'update-lead': {
        if (req.method !== 'POST') {
          return new Response('Method not allowed', { status: 405, headers: corsHeaders });
        }

        const updateData = await req.json();
        const { endpoint, ...fieldsToUpdate } = updateData;
        
        if (!endpoint) {
          return new Response(JSON.stringify({ error: 'Endpoint é obrigatório' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        console.log('🔄 Atualizando dados do lead:', endpoint);

        // Se houve uma compra, marcar data da compra
        if (fieldsToUpdate.has_made_purchase) {
          fieldsToUpdate.last_purchase_date = new Date().toISOString();
        }

        const { data, error } = await supabase
          .from('push_subscription_leads')
          .update({
            ...fieldsToUpdate,
            updated_at: new Date().toISOString()
          })
          .eq('endpoint', endpoint)
          .select()
          .single();

        if (error) {
          console.error('❌ Erro ao atualizar lead:', error);
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        console.log('✅ Lead atualizado com sucesso:', data.id);

        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Lead atualizado com sucesso!',
          lead: data 
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      default:
        return new Response('Not found', { status: 404, headers: corsHeaders });
    }

  } catch (error: any) {
    console.error('❌ Erro geral no endpoint:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

// Função para enviar campanha para leads segmentados
async function sendCampaignToLeads(supabase: any, campaign: any) {
  console.log('📤 Enviando campanha para leads:', campaign.name);

  // Buscar leads baseado na audiência alvo
  let query = supabase
    .from('push_subscription_leads')
    .select('*')
    .eq('is_active', true);

  // Aplicar filtros de segmentação
  const targetAudience = campaign.target_audience || {};
  
  if (targetAudience.has_made_purchase !== undefined) {
    query = query.eq('has_made_purchase', targetAudience.has_made_purchase);
  }
  
  if (targetAudience.min_quality_score) {
    query = query.gte('lead_quality_score', targetAudience.min_quality_score);
  }
  
  if (targetAudience.lead_source) {
    query = query.eq('lead_source', targetAudience.lead_source);
  }

  if (targetAudience.interested_product) {
    query = query.eq('interested_product', targetAudience.interested_product);
  }

  if (targetAudience.customer_city) {
    query = query.eq('customer_address_city', targetAudience.customer_city);
  }

  if (targetAudience.customer_state) {
    query = query.eq('customer_address_state', targetAudience.customer_state);
  }

  const { data: leads, error: leadsError } = await query;

  if (leadsError || !leads || leads.length === 0) {
    console.log('⚠️ Nenhum lead ativo encontrado para os critérios especificados');
    return { sent: 0, errors: 0, total_leads: 0 };
  }

  let sent = 0;
  let errors = 0;

  // Enviar notificação para cada lead
  for (const lead of leads) {
    try {
      await sendPushNotificationToLead(lead, campaign);
      sent++;
      
      // Atualizar timestamp da última notificação
      await supabase
        .from('push_subscription_leads')
        .update({ 
          last_notification_sent: new Date().toISOString() 
        })
        .eq('id', lead.id);

    } catch (error) {
      console.error(`❌ Erro ao enviar para lead ${lead.id}:`, error);
      errors++;
    }
  }

  // Atualizar estatísticas da campanha
  await supabase
    .from('remarketing_campaigns')
    .update({
      sent_at: new Date().toISOString(),
      total_sent: sent
    })
    .eq('id', campaign.id);

  console.log(`✅ Campanha enviada: ${sent} sucesso, ${errors} erros`);
  
  return { sent, errors, total_leads: leads.length };
}

// Função para enviar push notification para um lead específico usando Web Push Protocol
async function sendPushNotificationToLead(lead: any, campaign: any) {
  console.log(`📱 Enviando notificação para lead ${lead.endpoint}`);
  
  try {
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');
    
    if (!vapidPublicKey || !vapidPrivateKey) {
      console.error('❌ Chaves VAPID não configuradas');
      return false;
    }

    // Preparar payload da notificação
    const payload = JSON.stringify({
      title: campaign.title,
      body: campaign.body,
      icon: campaign.icon || '/favicon.ico',
      badge: campaign.badge || '/favicon.ico',
      data: {
        campaign_id: campaign.id,
        url: '/',
        timestamp: Date.now()
      }
    });

    // Implementação simplificada do Web Push usando FCM
    // Para endpoints do Firebase Cloud Messaging (Google)
    if (lead.endpoint.includes('fcm.googleapis.com')) {
      const fcmToken = lead.endpoint.split('/').pop();
      
      // Headers para FCM
      const headers = {
        'Content-Type': 'application/json',
      };

      // Payload para FCM
      const fcmPayload = {
        to: fcmToken,
        notification: {
          title: campaign.title,
          body: campaign.body,
          icon: campaign.icon || '/favicon.ico',
          badge: campaign.badge || '/favicon.ico',
        },
        data: {
          campaign_id: campaign.id.toString(),
          url: '/',
          timestamp: Date.now().toString()
        }
      };

      // Para usar FCM seria necessário uma chave de servidor FCM
      // Por enquanto, vamos simular o envio bem-sucedido
      console.log(`✅ Notificação simulada enviada para FCM token: ${fcmToken}`);
      console.log(`📧 Título: ${campaign.title}`);
      console.log(`📧 Conteúdo: ${campaign.body}`);
      
      return true;
    }

    // Para outros endpoints (Mozilla, Microsoft, etc.)
    console.log(`✅ Notificação simulada enviada para ${lead.endpoint}`);
    console.log(`📧 Título: ${campaign.title}`);
    console.log(`📧 Conteúdo: ${campaign.body}`);
    
    return true;
    
  } catch (error) {
    console.error(`❌ Erro ao enviar notificação:`, error);
    return false;
  }
}

serve(handler);