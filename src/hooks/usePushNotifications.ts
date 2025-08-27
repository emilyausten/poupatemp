import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Variável global para o toast handler
let globalToastHandler: ((title: string, message: string) => void) | null = null;

// Função para configurar o handler do toast
export const setToastHandler = (handler: (title: string, message: string) => void) => {
  globalToastHandler = handler;
};

interface PushNotifyConfig {
  debug?: boolean;
}

// Controles globais para evitar execuções múltiplas entre instâncias
let globalHasInitialized = false;
let globalNotificationsSent = new Set<string>();
let globalHasShownWelcome = false;

export const usePushNotifications = (config: PushNotifyConfig = { debug: true }) => {
  
  // Controle local para esta instância
  const hasInitialized = useRef(false);
  const hasShownWelcome = useRef(false);
  const hasRequestedPermission = useRef(false);
  // Função para solicitar permissão com máxima compatibilidade
  const requestNotificationPermission = async (): Promise<boolean> => {
    // Verificar suporte básico
    if (!('Notification' in window)) {
      console.log('❌ Notificações não suportadas neste navegador');
      return false;
    }

    console.log('🔔 Estado atual da permissão:', Notification.permission);
    
    if (Notification.permission === 'granted') {
      console.log('✅ Permissão já concedida!');
      return true;
    }
    
    // Solicitar permissão apenas se for 'default' (após interação do usuário)
    if (Notification.permission === 'default') {
      console.log('🔔 Solicitando permissão de notificações...');
      
      try {
        // Sempre usar a API moderna
        const permission = await Notification.requestPermission();
        
        console.log('🔔 Resultado da permissão:', permission);
        
        if (permission === 'granted') {
          console.log('✅ Permissão concedida!');
          // Capturar subscription imediatamente após permissão
          setTimeout(() => {
            capturePushSubscription();
            testNotification();
          }, 500);
          return true;
        } else {
          console.log('❌ Permissão negada pelo usuário');
        }
      } catch (error) {
        console.error('❌ Erro ao solicitar permissão:', error);
      }
    }
    
    return false;
  };

  // Função para testar notificação nativa avançada
  const testNotification = () => {
    if (Notification.permission === 'granted') {
      console.log('🔔 Enviando notificação NATIVA avançada...');
      
      try {
        const notification = new Notification('🔥 Notificação NATIVA!', {
          body: 'Vibração, som e botões como app real!',
          icon: '/lovable-uploads/4986e8f4-05cf-4ae2-96c2-26342a02c900.png',
          badge: '/lovable-uploads/4986e8f4-05cf-4ae2-96c2-26342a02c900.png',
          tag: 'test-native',
          requireInteraction: true, // Persistir até interação
          renotify: true,
          timestamp: Date.now(),
          // Botões de ação (como apps nativos)
          actions: [
            {
              action: 'view',
              title: '👀 Ver Agendamentos',
              icon: '/lovable-uploads/4986e8f4-05cf-4ae2-96c2-26342a02c900.png'
            },
            {
              action: 'schedule',
              title: '📅 Agendar Novo',
              icon: '/lovable-uploads/4986e8f4-05cf-4ae2-96c2-26342a02c900.png'
            },
            {
              action: 'dismiss',
              title: '❌ Dispensar',
              icon: '/lovable-uploads/4986e8f4-05cf-4ae2-96c2-26342a02c900.png'
            }
          ],
          data: {
            url: '/agendamento',
            timestamp: Date.now(),
            testType: 'native-advanced'
          },
          // Recursos nativos para Android (casting para incluir propriedades avançadas)
          vibrate: [300, 100, 300, 100, 300], // Padrão único de vibração
          sound: 'default'
        } as any);
        
        console.log('✅ Notificação NATIVA avançada criada:', notification);
        
        // Fechar automaticamente após 15 segundos (mais tempo para testar botões)
        setTimeout(() => {
          if (notification) {
            notification.close();
            console.log('🔔 Notificação fechada automaticamente');
          }
        }, 15000);
        
      } catch (error) {
        console.error('❌ Erro ao criar notificação nativa:', error);
      }
    } else {
      console.log('❌ Permissão não concedida para notificações');
    }
  };

  // Capturar push subscription e salvar como lead
  const capturePushSubscription = async () => {
    console.log('💾 === INICIANDO CAPTURA DE LEAD ===');
    
    try {
      console.log('💾 Verificando service worker...');
      const registration = await navigator.serviceWorker.ready;
      console.log('💾 Service worker pronto:', registration);
      
      // Primeiro tentar obter subscription existente
      console.log('💾 Buscando subscription existente...');
      let subscription = await registration.pushManager.getSubscription();
      console.log('💾 Subscription existente:', subscription);
      
      // Se não existe, criar uma nova (necessário para notificações funcionarem)
      if (!subscription) {
        console.log('💾 Criando nova subscription...');
        try {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: 'BGm-RiiMrw7P8skJlEg1gDz8JZK0Q2H-paiJ5XvD0AFFzrF58hembvWms4A0E2XTYOeu4pVg0gy3XDsBBRVmohY'
          });
          console.log('✅ Nova push subscription criada:', subscription);
        } catch (subError) {
          console.error('❌ Erro ao criar subscription:', subError);
          return; // Sair se não conseguir criar subscription
        }
      }

      // Agora salvar o lead no banco
      if (subscription) {
        console.log('💾 Preparando dados do lead...');
        
        // Tentar obter dados do localStorage (se o usuário preencheu formulários)
        const savedCustomerData = localStorage.getItem('customerData');
        let customerData = {};
        
        if (savedCustomerData) {
          try {
            customerData = JSON.parse(savedCustomerData);
            console.log('📝 Dados do cliente encontrados no localStorage:', customerData);
          } catch (e) {
            console.log('⚠️ Erro ao ler dados do cliente do localStorage');
          }
        }

        const subscriptionData = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
            auth: arrayBufferToBase64(subscription.getKey('auth'))
          },
          user_agent: navigator.userAgent,
          referrer: document.referrer,
          utm_source: new URLSearchParams(window.location.search).get('utm_source'),
          utm_medium: new URLSearchParams(window.location.search).get('utm_medium'),
          utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign'),
          // Incluir dados do cliente se disponíveis
          ...customerData,
          lead_source: 'notification_permission'
        };

        console.log('💾 Dados do lead preparados:', subscriptionData);
        console.log('💾 Enviando para manage-push-leads/save-lead...');
        
        // Salvar o lead no banco via edge function (não bloquear se falhar)
        try {
          const { data, error } = await supabase.functions.invoke('manage-push-leads/save-lead', {
            body: subscriptionData
          });

          if (error) {
            console.error('❌ Erro ao salvar lead:', error);
            console.error('❌ Detalhes do erro:', JSON.stringify(error, null, 2));
          } else {
            console.log('✅ Lead de push subscription salvo com sucesso!');
            console.log('✅ Resposta da API:', data);
            
            // Trackear evento de captura de lead
            trackEvent('push_lead_captured', {
              endpoint: subscription.endpoint,
              has_utm: !!(subscriptionData.utm_source || subscriptionData.utm_medium || subscriptionData.utm_campaign)
            });
          }
        } catch (leadError) {
          console.error('❌ Erro ao salvar lead (não crítico):', leadError);
          console.error('❌ Stack trace:', leadError.stack);
          // Continuar mesmo se salvar lead falhar
        }
      } else {
        console.error('❌ Nenhuma subscription disponível para capturar');
      }
    } catch (error) {
      console.error('❌ Erro ao capturar push subscription:', error);
      console.error('❌ Stack trace:', error.stack);
    }
    
    console.log('💾 === FIM DA CAPTURA DE LEAD ===');
  };

  // Converter ArrayBuffer para Base64
  const arrayBufferToBase64 = (buffer: ArrayBuffer | null): string => {
    if (!buffer) return '';
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  // Registrar Service Worker
  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registrado:', registration);
        return registration;
      } catch (error) {
        console.error('Erro ao registrar Service Worker:', error);
        return null;
      }
    }
    return null;
  };

  // Enviar evento para analytics
  const trackEvent = async (eventType: string, eventData: any = {}) => {
    if (config.debug) {
      console.log('Evento enviado:', eventType, eventData);
    }
    
    try {
      const { error } = await supabase.functions.invoke('analytics', {
        body: {
          event_type: eventType,
          event_data: {
            ...eventData,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            user_agent: navigator.userAgent,
            referrer: document.referrer
          }
        }
      });
      
      if (error) {
        console.warn('⚠️ Erro ao enviar evento para API:', error);
      } else {
        console.log('✅ Evento enviado para API com sucesso');
      }
    } catch (error) {
      console.error('❌ Erro de rede ao enviar evento:', error);
    }
  };

  // Função para enviar notificação nativa com máxima compatibilidade
  const sendNotification = async (title: string, body: string, tag?: string) => {
    // Verificar se já foi enviada
    const notificationId = tag || `${title}-${body}`;
    if (globalNotificationsSent.has(notificationId)) {
      console.log('🔔 Notificação já enviada:', notificationId);
      return;
    }

    console.log('🔔 Enviando notificação:', title, body);
    console.log('🔔 Permissão atual:', Notification.permission);

    // Sempre mostrar toast primeiro
    if (globalToastHandler) {
      globalToastHandler(title, body);
    }

    // Verificar se notificações estão disponíveis e permitidas
    if (!('Notification' in window)) {
      console.log('⚠️ Notificações não suportadas neste navegador');
      return;
    }

    if (Notification.permission !== 'granted') {
      console.log('⚠️ Sem permissão para notificações nativas');
      return;
    }

    try {
      console.log('🔔 Criando notificação nativa...');
      
      // Configurações otimizadas para máxima compatibilidade
      const options: NotificationOptions = {
        body: body,
        icon: '/lovable-uploads/4986e8f4-05cf-4ae2-96c2-26342a02c900.png',
        tag: tag || notificationId,
        badge: '/lovable-uploads/4986e8f4-05cf-4ae2-96c2-26342a02c900.png',
        silent: false,
        requireInteraction: false
      };

      const notification = new Notification(title, options);

      console.log('✅ Notificação nativa criada!');
      
      // Event listeners para debugging
      notification.onshow = () => {
        console.log('✅ Notificação mostrada na tela');
      };
      
      notification.onclick = () => {
        console.log('🖱️ Notificação clicada');
        notification.close();
        window.focus();
      };
      
      notification.onclose = () => {
        console.log('🔔 Notificação fechada');
      };
      
      notification.onerror = (error) => {
        console.error('❌ Erro na notificação:', error);
      };
      
      // Fechar automaticamente após 8 segundos (compatibilidade mobile)
      setTimeout(() => {
        if (notification) {
          notification.close();
        }
      }, 8000);
      
      // Marcar como enviada
      globalNotificationsSent.add(notificationId);
      
    } catch (error) {
      console.error('❌ Erro ao criar notificação:', error);
      
      // Fallback: tentar usar Service Worker se disponível
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          await registration.showNotification(title, {
            body: body,
            icon: '/lovable-uploads/4986e8f4-05cf-4ae2-96c2-26342a02c900.png',
            tag: tag || notificationId
          });
          console.log('✅ Notificação via Service Worker criada!');
          globalNotificationsSent.add(notificationId);
        } catch (swError) {
          console.error('❌ Erro ao usar Service Worker:', swError);
        }
      }
    }
  };

  // Gatilhos automáticos
  const triggers = {
    // Entrada no site - Notificação local simples
    siteEntry: () => {
      if (globalHasShownWelcome) return;
      globalHasShownWelcome = true;
      
      trackEvent('site_entry', {
        page: window.location.href,
        timestamp: new Date().toISOString()
      });
      
      // Usar notificação local simples que funciona
      sendNotification(
        '🔔 Boas-vindas',
        '👋 Olá! Bem-vindo ao Poupa — o jeito mais fácil de agendar seus documentos sem filas e sem stress. Vamos agilizar seu atendimento agora mesmo?',
        'welcome-entry'
      );
    },

    // PIX gerado - REMOVIDO para usar useAutoPushNotifications  
    pixGenerated: () => {
      trackEvent('pix_generated', {
        page: window.location.href,
        timestamp: new Date().toISOString()
      });
      
      // Notificação removida - usando o hook useAutoPushNotifications
    },

    purchase: () => {
      trackEvent('purchase_completed', {
        page: window.location.href
      });
      
      sendNotification(
        '✅ Pagamento Confirmado!',
        'Obrigado! Sua consulta foi processada com sucesso.',
        'purchase'
      );
    },

    cartAbandon: () => {
      trackEvent('cart_abandoned', {
        page: window.location.href
      });
      
      setTimeout(() => {
        sendNotification(
          '⏰ Não perca tempo!',
          'Finalize sua consulta de endereço agora mesmo!',
          'cart-abandon'
        );
      }, 30000); // 30 segundos
    },

    signup: () => {
      trackEvent('user_signup', {
        page: window.location.href
      });
      
      sendNotification(
        '🎉 Cadastro Realizado!',
        'Bem-vindo! Aproveite nossos serviços.',
        'welcome'
      );
    },

    formStart: () => {
      trackEvent('form_started', {
        page: window.location.href
      });
    },

    pageView: () => {
      trackEvent('page_view', {
        page: window.location.href
      });
    }
  };

  // Configurar listeners para elementos da página
  const setupEventListeners = () => {
    const handleClick = (e: Event) => {
      const target = e.target as HTMLElement;
      
      // Botões de compra/finalizar
      if (target.matches('.btn-purchase, .checkout-btn, #purchase-button, [data-purchase], .bg-gradient-to-r')) {
        triggers.purchase();
      }
      
      // Botões de adicionar ao carrinho
      if (target.matches('.add-to-cart, .btn-cart, [data-cart]')) {
        triggers.cartAbandon();
      }
      
      // Botões de cadastro
      if (target.matches('.btn-signup, .register-btn, [data-signup]')) {
        triggers.signup();
      }
    };

    const handleSubmit = (e: Event) => {
      const target = e.target as HTMLFormElement;
      if (target.matches('#signup-form, .signup-form, [data-signup-form]')) {
        triggers.signup();
      }
    };

    const handleFocus = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.matches('input, textarea, select')) {
        triggers.formStart();
      }
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('submit', handleSubmit);
    document.addEventListener('focus', handleFocus, true);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('submit', handleSubmit);
      document.removeEventListener('focus', handleFocus, true);
    };
  };

  // Inicializar
  const init = async () => {
    if (hasInitialized.current || globalHasInitialized) return; // Evita múltiplas inicializações
    hasInitialized.current = true;
    globalHasInitialized = true;
    
    console.log('🚀 Inicializando PushNotify...');
    
    // 1️⃣ PRIMEIRO: Registrar Service Worker
    console.log('🔧 Registrando Service Worker...');
    await registerServiceWorker();
    
    // 2️⃣ SEGUNDO: NÃO solicitar permissão automaticamente
    // A permissão deve ser solicitada apenas após interação do usuário
    console.log('📱 Sistema de notificações pronto - aguardando interação do usuário');
    
    const cleanup = setupEventListeners();
    trackEvent('pushnotify_initialized');
    triggers.pageView();
    
    // Notificação de entrada só será exibida após o usuário dar permissão
    console.log('🔔 Para receber notificações, o usuário deve clicar no botão de ativar');
    
    console.log('✅ PushNotify inicializado com sucesso!');
    return cleanup;
  };

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    
    init().then((cleanupFn) => {
      cleanup = cleanupFn;
    });

    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  return {
    trackEvent,
    sendNotification,
    triggers,
    requestPermission: requestNotificationPermission,
    testNotification
  };
};