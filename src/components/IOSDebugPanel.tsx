import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getNotificationSupport, isIOS, getIOSVersion, isStandalone } from '@/utils/deviceDetection';
export const IOSDebugPanel = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [testResult, setTestResult] = useState<string>('');
  useEffect(() => {
    collectDebugInfo();
  }, []);
  const collectDebugInfo = () => {
    const support = getNotificationSupport();
    const info = {
      // Detecção básica
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      isIOSDetected: isIOS(),
      iosVersion: getIOSVersion(),
      isStandalone: isStandalone(),
      // Suporte a notificações
      notificationInWindow: 'Notification' in window,
      notificationPermission: typeof Notification !== 'undefined' ? Notification.permission : 'não disponível',
      serviceWorkerSupported: 'serviceWorker' in navigator,
      pushManagerSupported: 'PushManager' in window,
      // Detecção do nosso sistema
      supportDetection: support,
      // Configurações do Safari
      cookiesEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack,
      language: navigator.language,
      // Protocolo
      protocol: window.location.protocol,
      isHTTPS: window.location.protocol === 'https:',
      // Modo privado (tentativa de detecção)
      mightBePrivateMode: false
    };

    // Tentar detectar modo privado
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
    } catch (e) {
      info.mightBePrivateMode = true;
    }
    setDebugInfo(info);
  };
  const testNotificationDirect = async () => {
    setTestResult('Testando...');
    try {
      // Teste 1: Verificar se Notification existe
      if (!('Notification' in window)) {
        setTestResult('❌ Notification API não está disponível neste navegador');
        return;
      }

      // Teste 2: Verificar permissão atual
      setTestResult('🔔 Verificando permissão atual...');
      console.log('Permissão atual:', Notification.permission);

      // Teste 3: Solicitar permissão
      if (Notification.permission === 'default') {
        setTestResult('🔔 Solicitando permissão...');
        const permission = await Notification.requestPermission();
        console.log('Resultado da permissão:', permission);
        if (permission === 'granted') {
          setTestResult('✅ Permissão concedida! Testando notificação...');

          // Teste 4: Criar notificação
          try {
            const notification = new Notification('🧪 Teste iOS 18', {
              body: 'Se você viu esta notificação, está funcionando!',
              icon: '/favicon.ico',
              tag: 'ios-test'
            });
            setTestResult('✅ Notificação criada com sucesso! Verifique se apareceu.');
            setTimeout(() => {
              notification.close();
            }, 5000);
          } catch (notifError) {
            setTestResult(`❌ Erro ao criar notificação: ${notifError.message}`);
          }
        } else {
          setTestResult(`❌ Permissão negada: ${permission}`);
        }
      } else if (Notification.permission === 'granted') {
        setTestResult('✅ Permissão já concedida! Testando notificação...');
        try {
          const notification = new Notification('🧪 Teste iOS 18 (já permitido)', {
            body: 'Testando notificação com permissão já concedida',
            icon: '/favicon.ico'
          });
          setTestResult('✅ Notificação criada! Se apareceu, está funcionando.');
          setTimeout(() => {
            notification.close();
          }, 5000);
        } catch (notifError) {
          setTestResult(`❌ Erro ao criar notificação: ${notifError.message}`);
        }
      } else {
        setTestResult(`❌ Permissão bloqueada: ${Notification.permission}`);
      }
    } catch (error) {
      setTestResult(`❌ Erro geral: ${error.message}`);
      console.error('Erro no teste:', error);
    }
  };
  const resetPermissions = () => {
    setTestResult('ℹ️ Para resetar permissões: Safari → Configurações → Privacidade e Segurança → Notificações → Remover este site');
  };
  if (!isIOS()) {
    return <Card className="m-4">
        
        
      </Card>;
  }
  return <Card className="m-4">
      <CardHeader>
        <CardTitle>🧪 Debug iOS 18 - Diagnóstico Completo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Informações Básicas */}
        <div>
          <h3 className="font-medium mb-2">📱 Detecção de Dispositivo:</h3>
          <div className="space-y-1 text-sm">
            <div>iOS Detectado: <Badge>{debugInfo.isIOSDetected ? 'Sim' : 'Não'}</Badge></div>
            <div>Versão iOS: <Badge>{debugInfo.iosVersion || 'Não detectada'}</Badge></div>
            <div>Modo Standalone (PWA): <Badge>{debugInfo.isStandalone ? 'Sim' : 'Não'}</Badge></div>
            <div>Protocolo: <Badge variant={debugInfo.isHTTPS ? 'default' : 'destructive'}>{debugInfo.protocol}</Badge></div>
            <div>Possível modo privado: <Badge variant={debugInfo.mightBePrivateMode ? 'destructive' : 'default'}>{debugInfo.mightBePrivateMode ? 'Sim' : 'Não'}</Badge></div>
          </div>
        </div>

        {/* Suporte a APIs */}
        <div>
          <h3 className="font-medium mb-2">🔧 Suporte a APIs:</h3>
          <div className="space-y-1 text-sm">
            <div>Notification API: <Badge variant={debugInfo.notificationInWindow ? 'default' : 'destructive'}>{debugInfo.notificationInWindow ? 'Disponível' : 'Não disponível'}</Badge></div>
            <div>Permissão atual: <Badge>{debugInfo.notificationPermission}</Badge></div>
            <div>Service Worker: <Badge variant={debugInfo.serviceWorkerSupported ? 'default' : 'destructive'}>{debugInfo.serviceWorkerSupported ? 'Suportado' : 'Não suportado'}</Badge></div>
            <div>Push Manager: <Badge variant={debugInfo.pushManagerSupported ? 'default' : 'destructive'}>{debugInfo.pushManagerSupported ? 'Disponível' : 'Não disponível'}</Badge></div>
          </div>
        </div>

        {/* Nossa Detecção */}
        <div>
          <h3 className="font-medium mb-2">🎯 Nossa Detecção:</h3>
          <div className="space-y-1 text-sm">
            <div>Plataforma: <Badge>{debugInfo.supportDetection?.platform}</Badge></div>
            <div>Suportado: <Badge variant={debugInfo.supportDetection?.supported ? 'default' : 'destructive'}>{debugInfo.supportDetection?.supported ? 'Sim' : 'Não'}</Badge></div>
            <div>Nível: <Badge>{debugInfo.supportDetection?.level}</Badge></div>
            <div className="text-xs text-gray-600">{debugInfo.supportDetection?.message}</div>
          </div>
        </div>

        {/* User Agent */}
        <div>
          <h3 className="font-medium mb-2">🔍 User Agent:</h3>
          <div className="text-xs bg-gray-100 p-2 rounded break-all">
            {debugInfo.userAgent}
          </div>
        </div>

        {/* Testes */}
        <div className="space-y-2">
          <h3 className="font-medium">🧪 Testes:</h3>
          <div className="flex gap-2">
            <Button onClick={testNotificationDirect} size="sm">
              Testar Notificação Direta
            </Button>
            <Button onClick={resetPermissions} variant="outline" size="sm">
              Como Resetar Permissões
            </Button>
            <Button onClick={collectDebugInfo} variant="outline" size="sm">
              Atualizar Info
            </Button>
          </div>
          {testResult && <div className="text-sm p-2 bg-blue-50 rounded">
              {testResult}
            </div>}
        </div>

        {/* Instruções */}
        <div className="bg-yellow-50 p-3 rounded text-sm">
          <h4 className="font-medium text-yellow-800">💡 Possíveis Problemas no iOS:</h4>
          <ul className="list-disc list-inside text-yellow-700 mt-1 space-y-1">
            <li>Navegação em modo privado (notificações bloqueadas)</li>
            <li>Configurações do Safari bloqueando notificações</li>
            <li>Site precisa estar em HTTPS</li>
            <li>Permissões foram negadas anteriormente</li>
            <li>Configurações de "Não Perturbe" ativas</li>
          </ul>
        </div>

      </CardContent>
    </Card>;
};