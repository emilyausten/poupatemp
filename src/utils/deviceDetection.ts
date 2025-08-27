// Utilitários para detecção de dispositivo e compatibilidade de notificações

export const isIOS = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

export const isStandalone = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true;
};

export const getIOSVersion = (): number => {
  const ua = navigator.userAgent;
  
  // Tentar diferentes padrões de detecção para iOS
  let match = ua.match(/OS (\d+)_(\d+)_?(\d+)?/); // iPhone OS X_Y_Z
  if (match) {
    return parseInt(match[1], 10);
  }
  
  // Padrão alternativo para iOS mais recentes
  match = ua.match(/Version\/(\d+)\.\d+/); // Version/X.Y
  if (match && isIOS()) {
    return parseInt(match[1], 10);
  }
  
  // Padrão para iPadOS
  match = ua.match(/iPad.*OS (\d+)_(\d+)/);
  if (match) {
    return parseInt(match[1], 10);
  }
  
  return 0;
};

export const supportsWebPushOnIOS = (): boolean => {
  if (!isIOS()) {
    return false;
  }
  
  const iosVersion = getIOSVersion();
  
  // PWA instalado sempre teve melhor suporte
  if (isStandalone()) {
    return true;
  }
  
  // iOS 16.4+ suporta web push no Safari
  if (iosVersion >= 16) {
    return true;
  }
  
  // Se não conseguiu detectar versão mas tem Notification API, assumir que suporta
  if (iosVersion === 0 && 'Notification' in window) {
    return true;
  }
  
  return false;
};

export const getNotificationSupport = () => {
  const ios = isIOS();
  const standalone = isStandalone();
  const webPushSupport = supportsWebPushOnIOS();
  
  if (!ios) {
    // Android/Desktop - suporte completo
    return {
      platform: 'android/desktop',
      supported: 'Notification' in window,
      level: 'full',
      message: 'Suporte completo para notificações'
    };
  }
  
  if (ios && standalone) {
    // PWA iOS - bom suporte
    return {
      platform: 'ios-pwa',
      supported: true,
      level: 'good',
      message: 'Suporte bom para notificações (PWA)'
    };
  }
  
  if (ios && webPushSupport) {
    // iOS 16.4+ Safari - suporte básico
    return {
      platform: 'ios-safari',
      supported: true,
      level: 'basic',
      message: 'Suporte básico para notificações (iOS 16.4+)'
    };
  }
  
  // iOS antigo - sem suporte
  return {
    platform: 'ios-old',
    supported: false,
    level: 'none',
    message: 'Notificações não suportadas nesta versão do iOS'
  };
};

export const getInstallPromptMessage = () => {
  if (isIOS() && !isStandalone()) {
    return {
      canInstall: true,
      message: 'Para melhor experiência, adicione à tela inicial: Safari → Compartilhar → Adicionar à Tela de Início',
      icon: '📱'
    };
  }
  
  return {
    canInstall: false,
    message: '',
    icon: ''
  };
}; 