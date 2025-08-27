import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WhatsAppRequest {
  customerName: string;
  customerPhone: string;
  pixCode: string;
  amount: number;
  serviceName: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { customerName, customerPhone, pixCode, amount, serviceName }: WhatsAppRequest = await req.json();

    const instanceId = Deno.env.get("ULTRAMSG_INSTANCE_ID");
    const token = Deno.env.get("ULTRAMSG_TOKEN");

    if (!instanceId || !token) {
      throw new Error("Credenciais da UltraMsg não configuradas");
    }

    // Formatar o valor em reais
    const formattedAmount = `R$ ${amount.toFixed(2).replace('.', ',')}`;

    // Criar a mensagem do WhatsApp
    const message = `🏛️ *POUPATEMPO - Pagamento PIX Gerado*

👤 *Cliente:* ${customerName}
📋 *Serviço:* ${serviceName}
💰 *Valor:* ${formattedAmount}

📱 *Código PIX (Copia e Cola):*
\`\`\`
${pixCode}
\`\`\`

⏰ *ATENÇÃO:* Este PIX expira em 30 minutos!

Para pagar:
1. Abra o app do seu banco
2. Escolha a opção PIX
3. Cole o código acima ou escaneie o QR Code
4. Confirme o pagamento

Após o pagamento, você receberá a confirmação por email.

---
*Poupatempo - Portal Oficial*`;

    // Enviar mensagem via UltraMsg
    const whatsappResponse = await fetch(`https://api.ultramsg.com/${instanceId}/messages/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        token: token,
        to: customerPhone,
        body: message,
        priority: '1'
      })
    });

    const whatsappResult = await whatsappResponse.json();

    if (!whatsappResponse.ok) {
      console.error('Erro ao enviar WhatsApp:', whatsappResult);
      throw new Error(`Erro ao enviar WhatsApp: ${whatsappResult.error || 'Erro desconhecido'}`);
    }

    console.log('WhatsApp enviado com sucesso:', whatsappResult);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "WhatsApp enviado com sucesso",
        whatsappId: whatsappResult.id
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Erro ao enviar WhatsApp:', error);
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