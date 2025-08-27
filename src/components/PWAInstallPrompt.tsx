import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { isIOS, isStandalone, getInstallPromptMessage } from '@/utils/deviceDetection';
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
  }>;
}
export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  useEffect(() => {
    // Verificar se já está instalado
    if (isStandalone()) {
      setIsInstalled(true);
      return;
    }

    // Verificar se deve mostrar prompt
    const shouldShow = !localStorage.getItem('pwa-install-dismissed');
    setShowInstallPrompt(shouldShow);

    // Listener para evento de instalação (Android Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listener para detectar quando PWA foi instalado
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      console.log('PWA foi instalado!');
    });
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);
  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Android Chrome - usar prompt nativo
      try {
        await deferredPrompt.prompt();
        const {
          outcome
        } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          console.log('Usuário aceitou instalar PWA');
        } else {
          console.log('Usuário rejeitou instalar PWA');
        }
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
      } catch (error) {
        console.error('Erro ao mostrar prompt de instalação:', error);
      }
    } else if (isIOS()) {
      // iOS - mostrar instruções manuais
      alert(getInstallPromptMessage());
    }
  };
  const dismissPrompt = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Se já está instalado, mostrar status
  if (isInstalled) {
    return <Card className="bg-green-50 border-green-200 m-4">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2">
            <Badge variant="default" className="bg-green-500">
              ✅ PWA Instalado
            </Badge>
            <span className="text-sm text-green-700">
              Notificações funcionando como app nativo!
            </span>
          </div>
        </CardContent>
      </Card>;
  }

  // Se não deve mostrar prompt, não renderizar nada
  if (!showInstallPrompt) {
    return null;
  }
  return <Card className="bg-blue-50 border-blue-200 m-4">
      
      
    </Card>;
};