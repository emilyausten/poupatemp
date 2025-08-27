import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type PushMessageType = '1' | '2' | '3' | '4' | '5' | '6';

interface PushMessage {
  title: string;
  body: string;
}

const predefinedMessages: Record<PushMessageType, PushMessage> = {
  '1': {
    title: '🔔 Boas-vindas',
    body: '👋 Olá! Bem-vindo ao Poupa — o jeito mais fácil de agendar seus documentos sem filas e sem stress. Vamos agilizar seu atendimento agora mesmo?'
  },
  '2': {
    title: '🔔 Início do agendamento',
    body: '📅 Agendamentos disponíveis de segunda a sexta, das 9h às 18h. Clique abaixo para iniciar o seu agora mesmo e garantir seu atendimento!'
  },
  '3': {
    title: '🔔 Após preencher os dados pessoais',
    body: '✅ Dados recebidos! Agora vamos gerar sua guia de pagamento via PIX. Isso garante o seu agendamento de forma rápida e segura.'
  },
  '4': {
    title: '🔔 Guia de pagamento emitida',
    body: '💳 Sua guia de pagamento foi gerada! Para confirmar o seu agendamento, realize o pagamento via PIX o quanto antes. ⏰ Válida por tempo limitado.'
  },
  '5': {
    title: '🔔 Pagamento confirmado',
    body: '🎉 Pagamento confirmado com sucesso! Seu agendamento está garantido. Em instantes, você receberá todos os detalhes.'
  },
  '6': {
    title: '🔔 Confirmação do agendamento',
    body: '📍 Tudo certo! Seu atendimento está agendado. 📅 Data e horário: [DATA/HORÁRIO] 📌 Endereço e informações completas foram enviadas para seu e-mail.'
  }
};

export const useAutoPushNotifications = () => {
  
  const sendNotificationToActiveLeads = async (messageType: PushMessageType, scheduledDateTime?: string) => {
    try {
      const message = predefinedMessages[messageType];
      
      // Se for mensagem 6 (confirmação), substitui placeholder pela data/horário
      let finalBody = message.body;
      if (messageType === '6' && scheduledDateTime) {
        finalBody = message.body.replace('[DATA/HORÁRIO]', scheduledDateTime);
      }

      console.log(`📤 Enviando notificação automática tipo ${messageType}:`, message.title, "- Conteúdo:", finalBody);

      // Criar campanha automática no sistema
      const { data, error } = await supabase.functions.invoke('manage-push-leads/create-campaign', {
        body: {
          name: `Auto: ${message.title} - ${new Date().toLocaleDateString('pt-BR')}`,
          title: message.title,
          body: finalBody,
          schedule_type: 'immediate'
        }
      });

      if (error) {
        console.error('❌ Erro ao enviar notificação automática:', error);
      } else {
        console.log('✅ Notificação automática enviada com sucesso:', data);
      }

      // Registrar evento de analytics
      await supabase.functions.invoke('analytics', {
        body: {
          event_type: 'push_notification_sent',
          event_data: {
            message_type: messageType,
            title: message.title,
            sent_to_all_leads: true,
            url: window.location.href
          }
        }
      });

    } catch (error) {
      console.error('❌ Erro ao processar notificação automática:', error);
    }
  };

  return {
    sendWelcomeMessage: () => sendNotificationToActiveLeads('1'),
    sendSchedulingStartMessage: () => sendNotificationToActiveLeads('2'),
    sendDataReceivedMessage: () => sendNotificationToActiveLeads('3'),
    sendPaymentGeneratedMessage: () => sendNotificationToActiveLeads('4'),
    sendPaymentConfirmedMessage: () => sendNotificationToActiveLeads('5'),
    sendSchedulingConfirmedMessage: (scheduledDateTime: string) => 
      sendNotificationToActiveLeads('6', scheduledDateTime),
  };
};