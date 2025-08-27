import { useState, useEffect } from 'react';
import { X, Bell } from 'lucide-react';

interface ToastNotificationProps {
  title: string;
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export const ToastNotification = ({ 
  title, 
  message, 
  isVisible, 
  onClose, 
  duration = 5000 
}: ToastNotificationProps) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 animate-slide-down">
      <div className="bg-gray-800/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-700/50 p-3 mx-auto max-w-sm">
        <div className="flex items-start gap-3">
          {/* Logo do Poupatempo */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg p-1">
              <img 
                src="/lovable-uploads/4986e8f4-05cf-4ae2-96c2-26342a02c900.png" 
                alt="Poupatempo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          
          {/* Conteúdo */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div>
                <h3 className="text-sm font-semibold text-white truncate">
                  {title}
                </h3>
                <p className="text-xs text-gray-300">Poupa Tempo</p>
              </div>
              <span className="text-xs text-gray-400 ml-2">agora</span>
            </div>
            <p className="text-sm text-gray-200 leading-snug mt-1">
              {message}
            </p>
          </div>
          
          {/* Botão fechar (opcional - pode remover se quiser mais fiel ao iOS) */}
          <button
            onClick={onClose}
            className="flex-shrink-0 ml-1 text-gray-400 hover:text-gray-200 transition-colors p-1"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Hook para gerenciar as notificações toast
export const useToastNotification = () => {
  const [notification, setNotification] = useState<{
    title: string;
    message: string;
    isVisible: boolean;
  }>({
    title: '',
    message: '',
    isVisible: false
  });

  const showToast = (title: string, message: string) => {
    setNotification({
      title,
      message,
      isVisible: true
    });
  };

  const hideToast = () => {
    setNotification(prev => ({
      ...prev,
      isVisible: false
    }));
  };

  return {
    notification,
    showToast,
    hideToast
  };
};