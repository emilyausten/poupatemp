import { supabase } from '@/integrations/supabase/client';

export interface CustomerData {
  customer_name?: string;
  customer_phone?: string;
  customer_cpf?: string;
  customer_address_street?: string;
  customer_address_number?: string;
  customer_address_complement?: string;
  customer_address_neighborhood?: string;
  customer_address_city?: string;
  customer_address_state?: string;
  customer_address_zip_code?: string;
  customer_address_country?: string;
  interested_product?: string;
  has_made_purchase?: boolean;
  purchase_amount?: number;
}

export const useCustomerData = () => {
  
  // Salvar dados do cliente no localStorage e atualizar lead
  const saveCustomerData = async (data: CustomerData) => {
    try {
      console.log('💾 Salvando dados do cliente:', data);
      
      // Salvar no localStorage para futuras referências
      const existingData = getStoredCustomerData();
      const mergedData = { ...existingData, ...data };
      localStorage.setItem('customerData', JSON.stringify(mergedData));
      
      // Tentar obter endpoint da push subscription para atualizar lead
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.getSubscription();
          
          if (subscription?.endpoint) {
            console.log('🔄 Atualizando lead com novos dados do cliente...');
            
            // Atualizar lead na base de dados
            const { data: result, error } = await supabase.functions.invoke('manage-push-leads/update-lead', {
              body: {
                endpoint: subscription.endpoint,
                ...mergedData,
                lead_source: 'form_fill'
              }
            });
            
            if (error) {
              console.error('❌ Erro ao atualizar lead:', error);
            } else {
              console.log('✅ Lead atualizado com dados do cliente:', result);
            }
          }
        } catch (error) {
          console.log('⚠️ Não foi possível atualizar lead (continuando normalmente):', error);
        }
      }
      
      return mergedData;
    } catch (error) {
      console.error('❌ Erro ao salvar dados do cliente:', error);
      throw error;
    }
  };

  // Obter dados do cliente do localStorage
  const getStoredCustomerData = (): CustomerData => {
    try {
      const stored = localStorage.getItem('customerData');
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('❌ Erro ao ler dados do cliente:', error);
      return {};
    }
  };

  // Marcar compra realizada
  const markPurchaseCompleted = async (amount?: number, productName?: string) => {
    const purchaseData: CustomerData = {
      has_made_purchase: true,
      purchase_amount: amount,
      interested_product: productName
    };
    
    return await saveCustomerData(purchaseData);
  };

  // Limpar dados do cliente
  const clearCustomerData = () => {
    localStorage.removeItem('customerData');
  };

  // Verificar se cliente tem dados completos
  const hasCompleteData = (data?: CustomerData): boolean => {
    const customerData = data || getStoredCustomerData();
    return !!(
      customerData.customer_name &&
      customerData.customer_phone &&
      customerData.customer_address_street &&
      customerData.customer_address_city &&
      customerData.customer_address_state
    );
  };

  // Calcular score de qualidade do lead
  const calculateLeadScore = (data?: CustomerData): number => {
    const customerData = data || getStoredCustomerData();
    let score = 1; // Base score para aceitar notificações
    
    if (customerData.customer_name) score += 1;
    if (customerData.customer_phone) score += 1;
    if (customerData.customer_address_street && customerData.customer_address_city && customerData.customer_address_state) score += 1;
    if (customerData.has_made_purchase) score += 1;
    
    return Math.min(score, 5);
  };

  return {
    saveCustomerData,
    getStoredCustomerData,
    markPurchaseCompleted,
    clearCustomerData,
    hasCompleteData,
    calculateLeadScore
  };
};