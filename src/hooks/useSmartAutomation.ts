import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useHybridNotifications } from '@/hooks/useHybridNotifications';
import { useCustomerData } from './useCustomerData';

interface AutomationRule {
  id: string;
  name: string;
  trigger: 'page_visit' | 'time_on_site' | 'form_abandon' | 'cart_abandon' | 'no_activity';
  condition: {
    page?: string;
    timeThreshold?: number; // em segundos
    inactivityPeriod?: number; // em minutos
  };
  delay: number; // em minutos
  campaign: {
    title: string;
    body: string;
    priority: 'low' | 'medium' | 'high';
  };
  enabled: boolean;
}

const DEFAULT_RULES: AutomationRule[] = [
  {
    id: 'welcome-engagement',
    name: 'Engajamento de Boas-vindas',
    trigger: 'time_on_site',
    condition: { timeThreshold: 30 }, // 30 segundos
    delay: 1,
    campaign: {
      title: '👋 Olá! Precisa de ajuda?',
      body: 'Vejo que você está navegando pelo nosso site. Posso ajudá-lo a agilizar seu atendimento?',
      priority: 'medium'
    },
    enabled: true
  },
  {
    id: 'form-abandon-recovery',
    name: 'Recuperação de Formulário Abandonado',
    trigger: 'form_abandon',
    condition: {},
    delay: 5,
    campaign: {
      title: '📝 Não perca seu progresso!',
      body: 'Você começou a preencher um formulário. Que tal finalizarmos juntos? É rápido!',
      priority: 'high'
    },
    enabled: true
  },
  {
    id: 'cart-abandon-immediate',
    name: 'Carrinho Abandonado - Imediato',
    trigger: 'cart_abandon',
    condition: {},
    delay: 2,
    campaign: {
      title: '🛒 Finalize seu agendamento!',
      body: 'Você estava quase finalizando! Não perca essa oportunidade de garantir seu atendimento.',
      priority: 'high'
    },
    enabled: true
  },
  {
    id: 'inactivity-nudge',
    name: 'Estímulo por Inatividade',
    trigger: 'no_activity',
    condition: { inactivityPeriod: 10 }, // 10 minutos
    delay: 0,
    campaign: {
      title: '⏰ Ainda por aqui?',
      body: 'Que tal agilizarmos seu atendimento? Temos horários disponíveis ainda hoje!',
      priority: 'low'
    },
    enabled: true
  },
  {
    id: 'payment-page-incentive',
    name: 'Incentivo na Página de Pagamento',
    trigger: 'page_visit',
    condition: { page: '/pagamento' },
    delay: 3,
    campaign: {
      title: '💳 Últimos passos!',
      body: 'Você está quase lá! Finalize o pagamento e garanta seu agendamento prioritário.',
      priority: 'high'
    },
    enabled: true
  }
];

export const useSmartAutomation = () => {
  const { getStoredCustomerData, calculateLeadScore } = useCustomerData();
  const { showHybridNotification } = useHybridNotifications();
  const automationState = useRef({
    timeOnSite: 0,
    lastActivity: Date.now(),
    formStarted: false,
    currentPage: '',
    triggeredRules: new Set<string>(),
    timers: new Map<string, NodeJS.Timeout>()
  });

  useEffect(() => {
    startAutomationEngine();
    
    return () => {
      // Limpar todos os timers ao desmontar
      automationState.current.timers.forEach(timer => clearTimeout(timer));
      automationState.current.timers.clear();
    };
  }, []);

  const startAutomationEngine = () => {
    console.log('🤖 Iniciando sistema de automação inteligente...');
    
    // Monitor de tempo no site
    const siteTimeInterval = setInterval(() => {
      automationState.current.timeOnSite += 1;
      checkTimeBasedRules();
    }, 1000);

    // Monitor de atividade do usuário
    const activityEvents = ['click', 'scroll', 'keypress', 'mousemove'];
    
    const updateActivity = () => {
      automationState.current.lastActivity = Date.now();
    };

    activityEvents.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    // Monitor de mudança de página
    const currentPath = window.location.pathname;
    automationState.current.currentPage = currentPath;
    checkPageVisitRules(currentPath);

    // Monitor de formulários
    setupFormMonitoring();

    // Monitor de inatividade
    const inactivityCheck = setInterval(() => {
      checkInactivityRules();
    }, 60000); // Verificar a cada minuto

    // Cleanup function
    return () => {
      clearInterval(siteTimeInterval);
      clearInterval(inactivityCheck);
      activityEvents.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
    };
  };

  const checkTimeBasedRules = () => {
    DEFAULT_RULES.forEach(rule => {
      if (!rule.enabled || automationState.current.triggeredRules.has(rule.id)) return;

      if (rule.trigger === 'time_on_site' && rule.condition.timeThreshold) {
        if (automationState.current.timeOnSite >= rule.condition.timeThreshold) {
          scheduleAutomation(rule);
        }
      }
    });
  };

  const checkPageVisitRules = (page: string) => {
    DEFAULT_RULES.forEach(rule => {
      if (!rule.enabled || automationState.current.triggeredRules.has(rule.id)) return;

      if (rule.trigger === 'page_visit' && rule.condition.page === page) {
        scheduleAutomation(rule);
      }
    });
  };

  const checkInactivityRules = () => {
    const now = Date.now();
    const inactiveMinutes = (now - automationState.current.lastActivity) / (1000 * 60);

    DEFAULT_RULES.forEach(rule => {
      if (!rule.enabled || automationState.current.triggeredRules.has(rule.id)) return;

      if (rule.trigger === 'no_activity' && rule.condition.inactivityPeriod) {
        if (inactiveMinutes >= rule.condition.inactivityPeriod) {
          scheduleAutomation(rule);
        }
      }
    });
  };

  const setupFormMonitoring = () => {
    // Monitor início de preenchimento de formulário
    const handleFormFocus = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.matches('input, textarea, select')) {
        automationState.current.formStarted = true;
        console.log('📝 Usuário começou a preencher formulário');
      }
    };

    // Monitor saída de página com formulário não finalizado
    const handleBeforeUnload = () => {
      if (automationState.current.formStarted) {
        triggerFormAbandonRules();
      }
    };

    // Monitor mudança de página com formulário não finalizado
    const handlePageChange = () => {
      if (automationState.current.formStarted) {
        triggerFormAbandonRules();
      }
    };

    document.addEventListener('focus', handleFormFocus, true);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePageChange);

    return () => {
      document.removeEventListener('focus', handleFormFocus, true);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePageChange);
    };
  };

  const triggerFormAbandonRules = () => {
    DEFAULT_RULES.forEach(rule => {
      if (!rule.enabled || automationState.current.triggeredRules.has(rule.id)) return;

      if (rule.trigger === 'form_abandon') {
        scheduleAutomation(rule);
      }
    });
  };

  const scheduleAutomation = (rule: AutomationRule) => {
    console.log(`🤖 Agendando automação: ${rule.name} em ${rule.delay} minutos`);
    
    // Marcar como triggered para evitar duplicação
    automationState.current.triggeredRules.add(rule.id);

    // Agendar execução
    const timeout = setTimeout(() => {
      executeAutomation(rule);
    }, rule.delay * 60 * 1000); // Converter minutos para millisegundos

    // Salvar referência do timer
    automationState.current.timers.set(rule.id, timeout);
  };

  const executeAutomation = async (rule: AutomationRule) => {
    try {
      console.log(`🚀 Executando automação: ${rule.name}`);

      // Obter dados do cliente para personalização
      const customerData = getStoredCustomerData();
      const leadScore = calculateLeadScore(customerData);

      // Personalizar mensagem baseada no lead score
      let personalizedBody = rule.campaign.body;
      
      if (customerData.customer_name) {
        personalizedBody = `Olá ${customerData.customer_name.split(' ')[0]}, ${personalizedBody.toLowerCase()}`;
      }

      // Adicionar urgência baseada na prioridade
      if (rule.campaign.priority === 'high') {
        personalizedBody += ' ⚡ Ação limitada!';
      }

      // Criar campanha automatizada
      const { data, error } = await supabase.functions.invoke('manage-push-leads/create-campaign', {
        body: {
          name: `Auto: ${rule.name} - ${new Date().toLocaleDateString('pt-BR')}`,
          title: rule.campaign.title,
          body: personalizedBody,
          schedule_type: 'immediate',
          target_audience: {
            min_quality_score: leadScore >= 3 ? 3 : 1 // Segmentar por qualidade
          }
        }
      });

      if (error) {
        console.error('❌ Erro ao executar automação:', error);
      } else {
        console.log('✅ Automação executada com sucesso:', data);
        
        // Mostrar notificação híbrida (nativa visual + real se permitida)
        showHybridNotification(rule.campaign.title, personalizedBody, {
          actions: [
            { action: 'view', title: '👀 Ver Detalhes' },
            { action: 'schedule', title: '📅 Agendar' },
            { action: 'dismiss', title: '❌ Dispensar' }
          ],
          duration: 10000,
          vibrate: [200, 100, 200, 100, 200],
          onAction: (action) => {
            console.log(`Ação da automação: ${action} para regra: ${rule.name}`);
          }
        });
        
        // Registrar evento de automação (usando event_type válido temporariamente)
        await supabase.functions.invoke('analytics', {
          body: {
            event_type: 'push_notification_sent', // Temporário até corrigir constraint
            event_data: {
              automation_type: 'automation_triggered', // Dados reais aqui
              rule_id: rule.id,
              rule_name: rule.name,
              trigger: rule.trigger,
              lead_score: leadScore,
              has_customer_data: !!customerData.customer_name,
              url: window.location.href
            }
          }
        });
      }

    } catch (error) {
      console.error('❌ Erro ao executar automação:', error);
    } finally {
      // Remover timer da lista
      automationState.current.timers.delete(rule.id);
    }
  };

  // Função para triggerar manualmente uma regra específica
  const triggerRule = (ruleId: string) => {
    const rule = DEFAULT_RULES.find(r => r.id === ruleId);
    if (rule && !automationState.current.triggeredRules.has(ruleId)) {
      scheduleAutomation(rule);
    }
  };

  // Função para cancelar uma automação agendada
  const cancelRule = (ruleId: string) => {
    const timer = automationState.current.timers.get(ruleId);
    if (timer) {
      clearTimeout(timer);
      automationState.current.timers.delete(ruleId);
      automationState.current.triggeredRules.delete(ruleId);
      console.log(`🛑 Automação cancelada: ${ruleId}`);
    }
  };

  // Função para obter status das automações
  const getAutomationStatus = () => {
    return {
      timeOnSite: automationState.current.timeOnSite,
      triggeredRules: Array.from(automationState.current.triggeredRules),
      activeTimers: Array.from(automationState.current.timers.keys()),
      formStarted: automationState.current.formStarted,
      currentPage: automationState.current.currentPage
    };
  };

  return {
    triggerRule,
    cancelRule,
    getAutomationStatus,
    DEFAULT_RULES
  };
}; 