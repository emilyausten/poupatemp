import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { transactionId } = await req.json();

    if (!transactionId) {
      throw new Error("Transaction ID é obrigatório");
    }

    // Para SyncPay, não temos endpoint de consulta individual
    // Vamos apenas verificar por tempo (mais de 30 minutos = expirado)
    const apiKey = '8c974b66420981f4efa313af';
    const { data: orderData, error: orderError } = await supabase
      .from('pix_orders')
      .select('created_at')
      .eq('transaction_id', transactionId)
      .single();

    if (orderError || !orderData) {
      throw new Error('Pedido não encontrado');
    }

    // Determinar o novo status baseado no tempo
    let newStatus = 'pending';
    const createdAt = new Date(orderData.created_at);
    const now = new Date();
    const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
    
    if (diffMinutes > 30) {
      newStatus = 'expired';
    }

    // Atualizar status no banco
    const { error: updateError } = await supabase
      .from('pix_orders')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('transaction_id', transactionId);

    if (updateError) {
      console.error('Erro ao atualizar status no banco:', updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        newStatus,
        transactionId,
        checkedByTime: true
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Erro na verificação de status:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});