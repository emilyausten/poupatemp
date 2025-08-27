import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, BellOff } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useMobileNotifications } from '@/hooks/useMobileNotifications';
import { Capacitor } from '@capacitor/core';

export const NotificationPermissionButton = () => {
  const [isRequesting, setIsRequesting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState(
    typeof window !== 'undefined' && 'Notification' in window 
      ? Notification.permission 
      : 'unsupported'
  );
  
  const { requestPermission } = usePushNotifications();
  const { sendMobileNotification } = useMobileNotifications();

  useEffect(() => {
    setIsMobile(Capacitor.isNativePlatform());
  }, []);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    
    try {
      // Se estiver no mobile, usar notificações móveis
      if (isMobile) {
        console.log('📱 Enviando notificação móvel...');
        await sendMobileNotification('✅ Funcionou!', 'Suas notificações estão ativas no mobile!');
        setPermissionStatus('granted');
        return;
      }

      // Se estiver na web, usar notificações web
      const granted = await requestPermission();
      setPermissionStatus(granted ? 'granted' : 'denied');
      
      // Se a permissão foi concedida, mostrar notificação de teste imediatamente
      if (granted) {
        console.log('✅ Permissão concedida! Enviando notificação de teste...');
        
        // Notificação nativa direta
        try {
          const notification = new Notification('✅ Funcionou!', {
            body: 'Suas notificações estão ativas! Você receberá atualizações importantes.',
            icon: '/favicon.ico'
          });
          
          // Fechar automaticamente após 5 segundos
          setTimeout(() => {
            notification.close();
          }, 5000);
          
        } catch (error) {
          console.error('❌ Erro ao criar notificação de teste:', error);
        }
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
    } finally {
      setIsRequesting(false);
    }
  };

  // Não mostrar o botão se já foi concedida ou se não há suporte
  if (permissionStatus === 'granted' || permissionStatus === 'unsupported') {
    return null;
  }

  return (
    <div className="flex flex-col items-center space-y-2 p-4 bg-card rounded-lg border">
      <div className="flex items-center space-x-2">
        {permissionStatus === 'denied' ? (
          <BellOff className="h-5 w-5 text-muted-foreground" />
        ) : (
          <Bell className="h-5 w-5 text-primary" />
        )}
        <span className="text-sm font-medium">
          {permissionStatus === 'denied' 
            ? 'Notificações bloqueadas' 
            : 'Ativar notificações'
          }
        </span>
      </div>
      
      <p className="text-xs text-muted-foreground text-center">
        {permissionStatus === 'denied' 
          ? 'Para receber notificações, ative-as nas configurações do navegador'
          : 'Receba atualizações sobre seus agendamentos'
        }
      </p>
      
      {permissionStatus === 'default' && (
        <Button 
          onClick={handleRequestPermission}
          disabled={isRequesting}
          size="sm"
          variant="outline"
        >
          {isRequesting ? 'Solicitando...' : 'Ativar Notificações'}
        </Button>
      )}
    </div>
  );
};