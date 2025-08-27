
// Service Worker para notificações push - v2.1 Profissional
self.addEventListener('install', function(event) {
  console.log('Service Worker instalado - v2.1');
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  console.log('Service Worker ativado - v2.1');
  
  // Limpar cache antigo
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          console.log('Limpando cache antigo:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Escutar mensagens push com máxima compatibilidade
self.addEventListener('push', function(event) {
  console.log('Service Worker recebeu push:', event);
  
  let title = 'Notificação';
  let options = {
    body: 'Nova notificação disponível',
    icon: '/lovable-uploads/4986e8f4-05cf-4ae2-96c2-26342a02c900.png',
    badge: '/lovable-uploads/4986e8f4-05cf-4ae2-96c2-26342a02c900.png',
    tag: 'poupatempo',
    silent: false,
    requireInteraction: false,
    // Recursos nativos para Android
    vibrate: [200, 100, 200], // Vibração como app nativo
    sound: 'default', // Som de notificação padrão
    actions: [
      {
        action: 'view',
        title: '👀 Ver',
        icon: '/lovable-uploads/4986e8f4-05cf-4ae2-96c2-26342a02c900.png'
      },
      {
        action: 'dismiss',
        title: '❌ Fechar',
        icon: '/lovable-uploads/4986e8f4-05cf-4ae2-96c2-26342a02c900.png'
      }
    ],
    // Configurações avançadas
    renotify: true, // Permite notificação mesmo com tag igual
    sticky: true, // Persistir até usuário interagir
    timestamp: Date.now(),
    data: {
      timestamp: Date.now(),
      url: '/',
      source: 'web-push'
    }
  };
  
  if (event.data) {
    try {
      const data = event.data.json();
      console.log('Dados da notificação push:', data);
      
      title = data.title || title;
      options.body = data.body || options.body;
      options.tag = data.tag || options.tag;
      options.data.url = data.url || options.data.url;
      
    } catch (error) {
      console.error('Erro ao processar push data:', error);
      // Usar dados padrão se houver erro
    }
  }

  console.log('Mostrando notificação nativa:', title, options);

  event.waitUntil(
    self.registration.showNotification(title, options)
      .then(() => {
        console.log('✅ Notificação mostrada com sucesso');
      })
      .catch((error) => {
        console.error('❌ Erro ao mostrar notificação:', error);
      })
  );
});

// Lidar com cliques nas notificações (incluindo botões de ação)
self.addEventListener('notificationclick', function(event) {
  console.log('Notificação clicada - Ação:', event.action);
  
  // Fechar notificação imediatamente (comportamento nativo)
  event.notification.close();

  // Verificar qual ação foi clicada
  if (event.action === 'dismiss') {
    console.log('Usuário dispensou a notificação');
    return; // Apenas fechar, não abrir app
  }
  
  // Para 'view' ou clique principal, abrir/focar app
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    self.clients.matchAll({ 
      type: 'window',
      includeUncontrolled: true 
    }).then(function(clientList) {
      // Procurar janela já aberta
      for (let client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          console.log('Focando janela existente');
          return client.focus().then(() => {
            // Navegar para URL específica se necessário
            if (urlToOpen !== '/' && 'navigate' in client) {
              return client.navigate(urlToOpen);
            }
          });
        }
      }
      
      // Abrir nova janela se não houver uma aberta
      if (self.clients.openWindow) {
        console.log('Abrindo nova janela:', urlToOpen);
        return self.clients.openWindow(urlToOpen);
      }
    }).catch(error => {
      console.error('Erro ao abrir app:', error);
    })
  );
});

// Listener para fechar notificação automaticamente após um tempo
self.addEventListener('notificationshow', function(event) {
  console.log('Notificação mostrada');
  
  // Auto-fechar após 8 segundos para parecer mais nativo
  setTimeout(() => {
    event.notification.close();
  }, 8000);
});
