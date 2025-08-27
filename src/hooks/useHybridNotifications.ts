// Hook híbrido para notificações - Reais + Customizadas
export const useHybridNotifications = () => {
  
  const showHybridNotification = (title: string, body: string, options: {
    actions?: Array<{ action: string; title: string }>;
    duration?: number;
    vibrate?: number[];
    onAction?: (action: string) => void;
    useCustomOnly?: boolean; // Forçar usar só customizada
  } = {}) => {
    
    const {
      actions = [
        { action: 'view', title: '👀 Ver' },
        { action: 'dismiss', title: '❌ Fechar' }
      ],
      duration = 8000,
      vibrate = [200, 100, 200],
      onAction,
      useCustomOnly = false
    } = options;

    // 1. SEMPRE mostrar notificação customizada (visual nativa)
    if ((window as any).showNativeNotification) {
      (window as any).showNativeNotification({
        title,
        body,
        actions,
        duration,
        vibrate,
        onAction: (action: string) => {
          console.log('Ação da notificação customizada:', action);
          onAction?.(action);
          
          // Navegar baseado na ação
          if (action === 'view') {
            window.location.href = '/agendamento';
          } else if (action === 'schedule') {
            window.location.href = '/';
          }
        }
      });
    }

    // 2. TAMBÉM tentar notificação real (se permitida e não forçada customizada)
    if (!useCustomOnly && 'Notification' in window && Notification.permission === 'granted') {
      try {
        const notification = new Notification(title, {
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'hybrid-notification',
          requireInteraction: true,
          actions: actions.map(a => ({
            action: a.action,
            title: a.title,
            icon: '/favicon.ico'
          })),
          data: {
            url: '/agendamento',
            timestamp: Date.now()
          },
          vibrate,
        } as any);

        // Auto-fechar notificação real após duração
        setTimeout(() => {
          notification.close();
        }, duration);

        console.log('✅ Notificação real + customizada enviadas!');
      } catch (error) {
        console.log('❌ Notificação real falhou, mas customizada funcionou:', error);
      }
    } else {
      console.log('🎨 Apenas notificação customizada (nativa visual)');
    }
  };

  return {
    showHybridNotification
  };
}; 