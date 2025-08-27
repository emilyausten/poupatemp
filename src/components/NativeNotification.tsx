import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './NativeNotification.css';

interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

interface NativeNotificationProps {
  title: string;
  body: string;
  icon?: string;
  actions?: NotificationAction[];
  duration?: number;
  vibrate?: number[];
  sound?: boolean;
  onAction?: (action: string) => void;
  onClose?: () => void;
  show: boolean;
}

export const NativeNotification: React.FC<NativeNotificationProps> = ({
  title,
  body,
  icon = '/lovable-uploads/4986e8f4-05cf-4ae2-96c2-26342a02c900.png',
  actions = [],
  duration = 8000,
  vibrate = [200, 100, 200],
  sound = true,
  onAction,
  onClose,
  show
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setIsAnimating(true);

      // Vibração nativa
      if ('vibrate' in navigator && vibrate) {
        navigator.vibrate(vibrate);
      }

      // Som de notificação (fallback)
      if (sound) {
        try {
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDSH0fPfczAHKYPJ8+OZRA0PVOzv4K1eGgU+ltryxnkpBSl+zPLaizoIGWe57+adTwwOUarm7r5kJAoyg8rx3o44CBdmtu3mn00MDlGn4+i8aB4FPJTd7byiFQxLoud2slgCBU6k5/q1bCQKMYHM8t6POwkUYLLp7blkHgU8lNz2uWYhBDBKxNq3bSELLaXLrEJVa4VCCpJUvTU4ZpMPCpeZhKVLY8PVqDhhvJKJeECB0tJMD0YhZJHIIhHEuJ8PCHG+1EvR8qYa9f71FuT9HjE=');
          audio.volume = 0.3;
          audio.play().catch(() => {});
        } catch (e) {}
      }

      // Auto-fechar
      const timer = setTimeout(() => {
        closeNotification();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, vibrate, sound]);

  const closeNotification = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  const handleActionClick = (action: string) => {
    onAction?.(action);
    closeNotification();
  };

  if (!isVisible) return null;

  const notificationElement = (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      {/* Overlay para capturar cliques fora */}
      <div 
        className="absolute inset-0 pointer-events-auto"
        onClick={closeNotification}
      />
      
      {/* Notificação no topo */}
      <div className={`
        absolute top-4 left-4 right-4 pointer-events-auto
        transform transition-all duration-300 ease-out
        ${isAnimating ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}
      `}>
        <div className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden max-w-sm mx-auto">
          
          {/* Header da notificação - imitando Android */}
          <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <img 
                src={icon} 
                alt="App Icon" 
                className="w-4 h-4 rounded-sm"
              />
              <span className="text-xs font-medium text-gray-600">Poupa Tempo</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-400">agora</span>
              <button 
                onClick={closeNotification}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          {/* Conteúdo principal */}
          <div className="p-4">
            <div className="flex items-start space-x-3">
              <img 
                src={icon} 
                alt="Notification Icon" 
                className="w-8 h-8 rounded-full flex-shrink-0 mt-1"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1">
                  {title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                  {body}
                </p>
              </div>
            </div>
          </div>

          {/* Botões de ação - estilo Android */}
          {actions.length > 0 && (
            <div className="px-4 pb-4">
              <div className="flex gap-2 justify-end">
                {actions.map((action, index) => (
                  <button
                    key={action.action}
                    onClick={() => handleActionClick(action.action)}
                    className={`
                      px-4 py-2 text-xs font-medium rounded-md transition-colors
                      ${index === 0 
                        ? 'bg-blue-500 text-white hover:bg-blue-600' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    `}
                  >
                    {action.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Indicador de progresso (opcional) */}
          <div className="h-1 bg-gray-100">
            <div 
              className="h-full bg-blue-500 transition-all ease-linear animate-shrink"
              style={{
                animationDuration: `${duration}ms`
              }}
            />
          </div>
        </div>
      </div>

      {/* CSS dinâmico para animação */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes shrink {
            from { width: 100%; }
            to { width: 0%; }
          }
          
          .animate-shrink {
            animation: shrink ${duration}ms linear forwards;
          }
          
          .line-clamp-1 {
            overflow: hidden;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 1;
          }
          
          .line-clamp-2 {
            overflow: hidden;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
          }
        `
      }} />
    </div>
  );

  return createPortal(notificationElement, document.body);
};

// Hook para usar notificações customizadas
export const useNativeNotifications = () => {
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    props: NativeNotificationProps;
  }>>([]);

  const showNotification = (props: Omit<NativeNotificationProps, 'show' | 'onClose'>) => {
    const id = Date.now().toString();
    
    const notification = {
      id,
      props: {
        ...props,
        show: true,
        onClose: () => {
          setNotifications(prev => prev.filter(n => n.id !== id));
        }
      }
    };

    setNotifications(prev => [...prev, notification]);

    // Auto-remover após duração + 1 segundo
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, (props.duration || 8000) + 1000);

    return id;
  };

  const hideNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return {
    notifications,
    showNotification,
    hideNotification,
    clearAll,
    NotificationContainer: () => (
      <>
        {notifications.map(({ id, props }) => (
          <NativeNotification key={id} {...props} />
        ))}
      </>
    )
  };
}; 