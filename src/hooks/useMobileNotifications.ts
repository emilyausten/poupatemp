import { useEffect } from 'react';
import { LocalNotifications, ScheduleOptions } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export const useMobileNotifications = () => {
  useEffect(() => {
    const initializeNotifications = async () => {
      // Só executar em ambiente mobile
      if (!Capacitor.isNativePlatform()) {
        console.log('🔔 Não é plataforma nativa, usando notificações web');
        return;
      }

      try {
        // Verificar se LocalNotifications está disponível
        if (!LocalNotifications) {
          console.error('❌ LocalNotifications plugin não está disponível');
          return;
        }

        // Configurar canal de notificação para Android
        await LocalNotifications.createChannel({
          id: 'default',
          name: 'Poupa Notificações',
          description: 'Notificações importantes sobre seus agendamentos',
          importance: 5, // IMPORTANCE_HIGH
          visibility: 1, // VISIBILITY_PUBLIC
          sound: 'beep.wav',
          vibration: true,
          lights: true,
          lightColor: '#488AFF'
        });

        // Solicitar permissão para notificações
        const permission = await LocalNotifications.requestPermissions();
        console.log('🔔 Permissão de notificações mobile:', permission);

        if (permission.display === 'granted') {
          console.log('✅ Permissão de notificações concedida no mobile!');
          
          // Configurar listeners para interações com notificações
          await LocalNotifications.addListener('localNotificationReceived', (notification) => {
            console.log('📱 Notificação recebida:', notification);
          });

          await LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
            console.log('📱 Ação na notificação:', action);
          });

          // Enviar notificação de teste com configurações otimizadas
          await LocalNotifications.schedule({
            notifications: [
              {
                title: '✅ Funcionou!',
                body: 'Suas notificações estão ativas no mobile!',
                id: 1,
                schedule: { at: new Date(Date.now() + 1000) }, // 1 segundo
                sound: 'beep.wav',
                smallIcon: 'ic_stat_icon_config_sample',
                iconColor: '#488AFF',
                attachments: undefined,
                actionTypeId: "",
                extra: {
                  timestamp: new Date().toISOString(),
                  source: 'initialization'
                },
                // Configurações específicas para Android
                channelId: 'default',
                ongoing: false,
                autoCancel: true
              }
            ]
          });
        }
      } catch (error) {
        console.error('❌ Erro ao configurar notificações mobile:', error);
      }
    };

    initializeNotifications();
  }, []);

  const sendMobileNotification = async (
    title: string, 
    body: string, 
    options: Partial<ScheduleOptions> = {}
  ) => {
    if (!Capacitor.isNativePlatform()) {
      console.log('🔔 Não é mobile, usando notificação web');
      return;
    }

    try {
      const notificationId = Math.floor(Math.random() * 1000);
      
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: notificationId,
            schedule: { at: new Date(Date.now() + 100) },
            sound: 'beep.wav',
            smallIcon: 'ic_stat_icon_config_sample',
            iconColor: '#488AFF',
            channelId: 'default',
            ongoing: false,
            autoCancel: true,
            attachments: undefined,
            actionTypeId: "",
            extra: {
              timestamp: new Date().toISOString(),
              source: 'manual'
            },
            // Permitir override de configurações
            ...options
          }
        ]
      });
      
      console.log('✅ Notificação mobile enviada:', title);
      return notificationId;
    } catch (error) {
      console.error('❌ Erro ao enviar notificação mobile:', error);
      throw error;
    }
  };

  const cancelNotification = async (id: number) => {
    if (!Capacitor.isNativePlatform()) return;
    
    try {
      await LocalNotifications.cancel({ notifications: [{ id }] });
      console.log('✅ Notificação cancelada:', id);
    } catch (error) {
      console.error('❌ Erro ao cancelar notificação:', error);
    }
  };

  const getPendingNotifications = async () => {
    if (!Capacitor.isNativePlatform()) return [];
    
    try {
      const result = await LocalNotifications.getPending();
      console.log('📱 Notificações pendentes:', result.notifications);
      return result.notifications;
    } catch (error) {
      console.error('❌ Erro ao obter notificações pendentes:', error);
      return [];
    }
  };

  return { 
    sendMobileNotification, 
    cancelNotification, 
    getPendingNotifications 
  };
};