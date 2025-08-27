import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useHybridNotifications } from '@/hooks/useHybridNotifications';
export const NativeNotificationTest = () => {
  const {
    showHybridNotification
  } = useHybridNotifications();
  const testNotifications = [{
    title: '🔥 Notificação Nativa Customizada',
    body: 'Visual idêntico ao Android! Vibração, som e botões funcionando.',
    actions: [{
      action: 'view',
      title: '👀 Ver Agendamentos'
    }, {
      action: 'schedule',
      title: '📅 Agendar'
    }, {
      action: 'dismiss',
      title: '❌ Fechar'
    }]
  }, {
    title: '📅 Lembrete de Agendamento',
    body: 'Seu agendamento é amanhã às 14:00. Não se esqueça!',
    actions: [{
      action: 'view',
      title: '✅ Confirmar'
    }, {
      action: 'dismiss',
      title: '⏰ Lembrar +1h'
    }]
  }, {
    title: '🎉 Agendamento Confirmado',
    body: 'Parabéns! Seu agendamento foi confirmado com sucesso.',
    actions: [{
      action: 'view',
      title: '📋 Ver Detalhes'
    }, {
      action: 'dismiss',
      title: '👍 OK'
    }]
  }, {
    title: '⚠️ Ação Necessária',
    body: 'Complete seu cadastro para finalizar o agendamento.',
    actions: [{
      action: 'view',
      title: '🔧 Completar'
    }, {
      action: 'dismiss',
      title: '⏭️ Depois'
    }]
  }];
  const handleTestNotification = (index: number) => {
    const test = testNotifications[index];
    showHybridNotification(test.title, test.body, {
      actions: test.actions,
      duration: 12000,
      // 12 segundos para testar botões
      vibrate: [300, 100, 300, 100, 300],
      // Padrão único por teste
      onAction: action => {
        console.log(`Ação executada: ${action} para notificação: ${test.title}`);

        // Feedback visual
        if ((window as any).showNativeNotification) {
          (window as any).showNativeNotification({
            title: '✅ Ação Executada!',
            body: `Você clicou em: ${test.actions.find(a => a.action === action)?.title}`,
            duration: 3000,
            actions: [{
              action: 'dismiss',
              title: '👍 OK'
            }]
          });
        }
      }
    });
  };
  const testPermissionStatus = () => {
    const permission = 'Notification' in window ? Notification.permission : 'not-supported';
    const hasCustom = !!(window as any).showNativeNotification;
    if ((window as any).showNativeNotification) {
      (window as any).showNativeNotification({
        title: '🧪 Status do Sistema',
        body: `Notificações reais: ${permission} | Customizadas: ${hasCustom ? 'Ativas' : 'Inativas'}`,
        duration: 6000,
        actions: [{
          action: 'view',
          title: '📊 Ver Detalhes'
        }, {
          action: 'dismiss',
          title: '👍 OK'
        }]
      });
    }
  };
  return <Card className="m-4 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
      
      
    </Card>;
};