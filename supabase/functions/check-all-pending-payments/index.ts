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

    // Buscar todos os pedidos pendentes com transaction_id (SEM LIMITE)
    let allPendingOrders: any[] = [];
    let start = 0;
    const batchSize = 1000;
    let hasMore = true;

    // Buscar todos os registros em lotes para contornar o limite do Supabase
    while (hasMore) {
      const { data: pendingOrders, error: fetchError } = await supabase
        .from('pix_orders')
        .select('id, transaction_id, created_at')
        .eq('status', 'pending')
        .not('transaction_id', 'is', null)
        .range(start, start + batchSize - 1);

      if (fetchError) {
        throw fetchError;
      }

      if (pendingOrders && pendingOrders.length > 0) {
        allPendingOrders = [...allPendingOrders, ...pendingOrders];
        start += batchSize;
        
        if (pendingOrders.length < batchSize) {
          hasMore = false;
        }
      } else {
        hasMore = false;
      }
    }

    console.log(`Encontrados ${allPendingOrders.length} pedidos pendentes para verificar`);

    const apiKey = '8c974b66420981f4efa313af';
    const authToken = `Basic ${btoa(apiKey)}`;
    let updatedCount = 0;

    for (const order of allPendingOrders || []) {
      try {
        // Para SyncPay, apenas verificamos por tempo (30 minutos)
        let newStatus = 'pending';
        const createdAt = new Date(order.created_at);
        const now = new Date();
        const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
        
        if (diffMinutes > 30) {
          newStatus = 'expired';
        }

        // Atualizar se o status mudou
        if (newStatus !== 'pending') {
          const { error: updateError } = await supabase
            .from('pix_orders')
            .update({ 
              status: newStatus,
              updated_at: new Date().toISOString()
            })
            .eq('id', order.id);

          if (!updateError) {
            updatedCount++;
            console.log(`Pedido ${order.id} atualizado para ${newStatus}`);
          } else {
            console.error(`Erro ao atualizar pedido ${order.id}:`, updateError);
          }
        }
        
        // Aguardar um pouco entre as requisições para não sobrecarregar a API
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`Erro ao verificar pedido ${order.id}:`, error);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Verificação concluída. ${updatedCount} pedidos atualizados.`,
        totalChecked: allPendingOrders.length,
        totalUpdated: updatedCount
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Erro na verificação em lote:', error);
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