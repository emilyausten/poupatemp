
import React, { useState, useEffect } from 'react';
import { FileText, CreditCard, Mail, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import UltimosAgendamentos from '@/components/UltimosAgendamentos';
import TestemunhosClientes from '@/components/TestemunhosClientes';
import MetricasDesempenho from '@/components/MetricasDesempenho';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useAutoPushNotifications } from '@/hooks/useAutoPushNotifications';
import { NotificationToast } from '@/components/NotificationToast';
import { getNotificationSupport } from '@/utils/deviceDetection';
import { IOSDebugPanel } from '@/components/IOSDebugPanel';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';
import { NativeNotificationTest } from '@/components/NativeNotificationTest';

const Servicos = () => {
  const navigate = useNavigate();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [showNotificationToast, setShowNotificationToast] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'denied'>('success');
  const [selectedServiceName, setSelectedServiceName] = useState('');
  
  // Hooks de notificações
  const { sendNotification, requestPermission } = usePushNotifications({ debug: true });
  const { sendSchedulingStartMessage } = useAutoPushNotifications();

  // Remover useEffect antigo

  const servicos = [
    {
      nome: 'RG - Primeira Via',
      descricao: 'Solicite sua primeira via do RG',
      valor: 74.00
    },
    {
      nome: 'RG - Segunda Via',
      descricao: 'Solicite a segunda via do seu RG',
      valor: 63.00
    },
    {
      nome: 'CNH - Primeira Via',
      descricao: 'Solicite sua primeira habilitação',
      valor: 52.00
    },
    {
      nome: 'CNH - Renovação',
      descricao: 'Renove sua Carteira Nacional de Habilitação',
      valor: 74.00
    },
    {
      nome: 'Licenciamento (CRLV-e)',
      descricao: 'Importante: Preencha os dados para pagamento do Licenciamento.',
      valor: 63.00
    },
    {
      nome: 'Carteira Profissional - Segunda Via',
      descricao: 'Reemissão da Carteira de Profissional por motivo de perda, roubo, alteração do nome do profissional ou dados no documento.',
      valor: 52.00
    },
    {
      nome: 'CIN - Primeira Via',
      descricao: 'Obter Carteira de Identidade Nacional - CIN',
      valor: 74.00
    },
    {
      nome: 'CIN - Segunda Via',
      descricao: 'Obter segunda via da Carteira de Identidade Nacional - CIN',
      valor: 63.00
    }
  ];

  const faqItems = [
    {
      pergunta: 'Como faço para agendar um serviço?',
      resposta: 'É muito simples! Escolha o serviço desejado, preencha seus dados pessoais, selecione data e horário disponível e confirme o agendamento.'
    },
    {
      pergunta: 'Posso cancelar ou remarcar meu agendamento?',
      resposta: 'Sim, você pode cancelar ou remarcar seu agendamento até 24 horas antes da data marcada através do nosso sistema.'
    },
    {
      pergunta: 'Posso agendar para outras pessoas?',
      resposta: 'Sim, você pode agendar para familiares, mas a pessoa deve comparecer pessoalmente no dia do atendimento com os documentos necessários.'
    },
    {
      pergunta: 'Atendem pessoas com necessidades especiais?',
      resposta: 'Sim, todas as unidades são adaptadas e preparadas para atender pessoas com necessidades especiais com todo conforto e acessibilidade.'
    },
    {
      pergunta: 'Como entro em contato se tiver problemas?',
      resposta: 'Você pode entrar em contato através do chat online, e-mail ou telefone disponíveis no site. Nossa equipe está pronta para ajudar.'
    }
  ];

  const handleServicoClick = async (servico: { nome: string; valor: number; descricao: string }) => {
    // Armazenar dados do serviço selecionado no localStorage
    localStorage.setItem('servicoSelecionado', JSON.stringify(servico));
    console.log('Serviço selecionado:', servico);
    
    // Configurar nome do serviço para o toast
    setSelectedServiceName(servico.nome);
    
    // 🔔 Verificar suporte da plataforma e solicitar permissão
    const support = getNotificationSupport();
    console.log('🔔 Plataforma detectada:', support.platform, '- Suporte:', support.level);
    
    // Solicitar permissão apenas se plataforma suportar
    let permissionGranted = false;
    if (support.supported) {
      console.log('🔔 Solicitando permissão de notificações após seleção do serviço...');
      permissionGranted = await requestPermission();
    } else {
      console.log('📱 Plataforma não suporta notificações web, mas continuando...');
    }
    
    if (permissionGranted) {
      console.log('✅ Permissão concedida! Enviando notificações...');
      
      // Mostrar toast de sucesso
      setToastType('success');
      setShowNotificationToast(true);
      
      // 🔔 Notificação automática de início do agendamento
      sendSchedulingStartMessage();
      
      // Notificação local também
      sendNotification(
        '🔔 Perfeito! Vamos agilizar seu atendimento',
        `📅 ${servico.nome} selecionado! Agendamentos disponíveis de segunda a sexta, das 9h às 18h. Vamos continuar?`,
        'scheduling-start'
      );
    } else {
      console.log('⚠️ Permissão de notificações negada, mas continuando o processo...');
      
      // Mostrar toast informativo
      setToastType('denied');
      setShowNotificationToast(true);
      
      // Mesmo sem notificações, continuar o processo
      sendNotification(
        '📋 Serviço Selecionado',
        `${servico.nome} - Vamos prosseguir com seu agendamento!`,
        'service-selected'
      );
    }
    
    // Aguardar um pouco para o usuário ver o feedback, depois navegar
    setTimeout(() => {
      navigate('/dados-pessoais');
    }, 2000);
  };

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <img 
            src="/lovable-uploads/77c50366-3c6d-4d7b-b8a7-4fa2fc4e1fa3.png" 
            alt="Poupatempo" 
            className="h-8 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate('/')}
          />
          <div className="flex gap-8">
            <button 
              className="text-gray-600 hover:text-blue-600 transition-colors"
              onClick={() => navigate('/')}
            >
              Início
            </button>
            <button className="text-blue-600 border-b-2 border-blue-600 pb-1">
              Serviços
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6">
        {/* Title */}
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Serviços Disponíveis
        </h1>

        {/* Services Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-12">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-800 mb-6">
              Selecione o serviço desejado
            </h2>
            
            <div className="space-y-3">
              {servicos.map((servico, index) => (
                <div 
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors flex justify-between items-center"
                  onClick={() => handleServicoClick(servico)}
                >
                  <div>
                    <h3 className="font-medium text-blue-600 text-sm mb-1">
                      {servico.nome}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {servico.descricao}
                    </p>
                  </div>
                  <div className="text-gray-400">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Como solicitar section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
            Como solicitar o agendamento online?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-3">
                Escolha o Serviço
              </h3>
              <p className="text-sm text-gray-600">
                Selecione o tipo de documento que você precisa entre nossos serviços e documentos disponíveis
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-3">
                Preencha os Dados
              </h3>
              <p className="text-sm text-gray-600">
                Insira suas informações pessoais, data e horário que deseja realizar o atendimento
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-3">
                Compareça no Local
              </h3>
              <p className="text-sm text-gray-600">
                Vá até a unidade escolhida na data agendada com os documentos necessários
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
            Dúvidas Frequentes
          </h2>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {faqItems.map((item, index) => (
              <div key={index} className="border-b border-gray-200 last:border-b-0">
                <button
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  onClick={() => toggleFaq(index)}
                >
                  <span className="text-blue-600 font-medium text-sm">
                    {item.pergunta}
                  </span>
                  <ChevronDown 
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      expandedFaq === index ? 'rotate-180' : ''
                    }`} 
                  />
                </button>
                {expandedFaq === index && (
                  <div className="px-6 pb-4">
                    <p className="text-sm text-gray-600">
                      {item.resposta}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Últimos Agendamentos */}
      <UltimosAgendamentos />

      {/* Depoimentos de Clientes */}
      <TestemunhosClientes />

      {/* Métricas de Desempenho */}
      <MetricasDesempenho />

      {/* Footer */}
      <div className="bg-slate-800 text-white">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center">
          <img 
            src="/lovable-uploads/a01f8b20-e4c2-4d31-bfe8-4c0e6d88ddd4.png" 
            alt="Gov.br" 
            className="h-12 mx-auto mb-4"
          />
          <h2 className="text-lg font-medium mb-2">Portal OficiaI</h2>
          <p className="text-sm text-gray-300 mb-6">
            Ministério da Gestão e da Inovação em Serviços Públicos
          </p>
          <div className="border-t border-gray-600 pt-4">
            <p className="text-xs text-gray-400">
              Todos os direitos reservados
            </p>
          </div>
        </div>
      </div>

      {/* Toast de Feedback de Notificações */}
      <NotificationToast 
        show={showNotificationToast}
        type={toastType}
        serviceName={selectedServiceName}
        onClose={() => setShowNotificationToast(false)}
      />

      {/* PWA Install Prompt - Para notificações mais nativas */}
      <PWAInstallPrompt />

      {/* Teste de Notificações Nativas Customizadas */}
      <NativeNotificationTest />

      {/* Debug Panel para iOS (temporário) */}
      <IOSDebugPanel />

    </div>
  );
};

export default Servicos;
