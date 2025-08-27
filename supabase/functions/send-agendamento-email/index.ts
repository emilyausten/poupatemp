import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Teste - função iniciada');
    
    // Parse do body da requisição
    const data = await req.json();
    console.log('📋 Dados recebidos:', data);

    const { nome, email } = data;

    // Verificar se a chave API está configurada
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    console.log('🔑 RESEND_API_KEY existe?', !!resendApiKey);
    console.log('🔑 Primeiros caracteres:', resendApiKey?.substring(0, 10));

    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY não configurada');
    }

    // Tentar importar e usar o Resend
    const { Resend } = await import("npm:resend@2.0.0");
    console.log('📦 Resend importado com sucesso');

    const resend = new Resend(resendApiKey);
    console.log('✅ Resend inicializado');

    // Agora usando o domínio próprio configurado
    const emailResponse = await resend.emails.send({
      from: "noreply@poupagenda.site", // Usando seu domínio verificado
      to: [email], // Enviando para o email real do usuário
      subject: `Teste - Agendamento de ${nome}`,
      html: `
        <h1>🔔 Confirmação de Agendamento</h1>
        <p>Olá <strong>${nome}</strong>!</p>
        <p><strong>Email original:</strong> ${email}</p>
        <p>Este é um teste do sistema de emails.</p>
        <p>Em produção, este email seria enviado para: ${email}</p>
      `,
    });

    console.log('📨 Resposta completa do Resend:', JSON.stringify(emailResponse, null, 2));

    if (emailResponse.error) {
      console.error('❌ Erro específico do Resend:', emailResponse.error);
      throw new Error(`Resend Error: ${JSON.stringify(emailResponse.error)}`);
    }

    console.log('✅ Email enviado! ID:', emailResponse.data?.id);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Email enviado com sucesso",
      emailId: emailResponse.data?.id,
      resendResponse: emailResponse
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("💥 Erro completo:", error);
    console.error("💥 Mensagem:", error.message);
    console.error("💥 Stack:", error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack,
        success: false 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);