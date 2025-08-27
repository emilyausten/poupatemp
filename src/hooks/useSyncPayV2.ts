import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Interfaces para SyncPay API V2
interface SyncPayCustomer {
  name: string;
  email: string;
  phone?: string;
  cpf: string;
  externaRef: string; // Campo obrigatório da SyncPay V2
  address?: {
    street?: string;
    streetNumber?: string;
    complement?: string;
    zipCode?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    country?: string;
  };
}

interface SyncPayItem {
  title: string;
  quantity: number;
  unitPrice: number;
  tangible: boolean;
}

interface SyncPayAPIRequest {
  ip: string; // Campo obrigatório da SyncPay V2
  amount: number;
  customer: SyncPayCustomer;
  items: SyncPayItem[];
  postbackUrl: string;
  pix?: {
    expiresInDays?: string;
  };
  metadata?: {
    provider: string;
    sell_url: string;
    order_url: string;
    user_email: string;
    user_identitication_number: string;
  };
  traceable?: boolean;
}

interface SyncPayResponse {
  id: string;
  status: string;
  pix_code?: string;
  pix_qr_code?: string;
  qr_code_base64?: string;
  qrCode?: string;
  transaction?: any;
  urlWebHook?: string;
}

interface SyncPayRequest {
  postbackUrl: string;
  paymentMethod: 'pix';
  customer: {
    name: string;
    email: string;
    phone: string;
    document: {
      number: string;
      type: 'cpf';
    };
  };
  shipping: {
    fee: number;
    address: {
      street: string;
      streetNumber: string;
      zipCode: string;
      neighborhood: string;
      city: string;
      state: string;
      country: string;
      complement?: string;
    };
  };
  items: {
    title: string;
    description: string;
    unitPrice: number;
    quantity: number;
    tangible: boolean;
  }[];
  isInfoProducts: boolean;
}

interface PaymentDetails {
  id: string;
  status: string;
  pix_code?: string;
  pix_qr_code?: string;
  qr_code_base64?: string;
}

// Constantes
const EDGE_FUNCTION_URL = 'https://werfsbezbsprestfpsxd.supabase.co/functions/v1/syncpay-payment-v2';

// Tipos para validação
type Item = { title: string; quantity: number; tangible: boolean; unitPrice: number };
type Address = { city: string; state: string; street: string; country: string; zipCode: string; complement?: string; neighborhood: string; streetNumber: string | number };
type Customer = { cpf: string; name: string; email: string; phone: string; externaRef: string; address: Address };

// Função de validação
function ensure(value: any, name: string) {
  if (value === undefined || value === null) throw new Error(`Campo obrigatório ausente: ${name}`);
}

function validatePayload(payload: any) {
  console.log('🔍 Iniciando validação do payload...');
  
  // checagens essenciais
  ensure(payload.ip, 'ip');
  console.log('✅ ip validado:', payload.ip);
  
  ensure(payload.pix && typeof payload.pix.expiresInDays === 'string', 'pix.expiresInDays (deve ser string)');
  console.log('✅ pix.expiresInDays validado:', payload.pix.expiresInDays);
  
  ensure(Array.isArray(payload.items) && payload.items.length > 0, 'items');
  console.log('✅ items validado:', payload.items.length, 'itens');
  
  payload.items.forEach((it: any, idx: number) => {
    ensure(it.title, `items[${idx}].title`);
    ensure(typeof it.quantity === 'number', `items[${idx}].quantity`);
    ensure(typeof it.tangible === 'boolean', `items[${idx}].tangible`);
    ensure(typeof it.unitPrice === 'number', `items[${idx}].unitPrice`);
  });
  
  ensure(typeof payload.amount === 'number', 'amount');
  console.log('✅ amount validado:', payload.amount);
  
  ensure(payload.customer, 'customer');
  console.log('✅ customer validado');
  
  // campos do customer
  ['cpf','name','email','phone','externaRef','address'].forEach(key => {
    ensure(payload.customer[key], `customer.${key}`);
    console.log(`✅ customer.${key} validado:`, payload.customer[key]);
  });
  
  // address fields
  ['city','state','street','country','zipCode','neighborhood','streetNumber'].forEach(key => {
    ensure(payload.customer.address[key], `customer.address.${key}`);
    console.log(`✅ customer.address.${key} validado:`, payload.customer.address[key]);
  });
  
  ensure(payload.postbackUrl && payload.postbackUrl.startsWith('http'), 'postbackUrl (deve ser URL pública)');
  console.log('✅ postbackUrl validado:', payload.postbackUrl);
  
  console.log('🎉 Validação do payload concluída com sucesso!');
}

export const useSyncPayV2 = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTransaction = async (payload: SyncPayAPIRequest): Promise<SyncPayResponse> => {
    setLoading(true);
    setError(null);

    try {
      console.log('🚀 useSyncPayV2 - Iniciando criação de transação...');
      console.log('📦 Payload enviado:', JSON.stringify(payload, null, 2));
      
      // Validar payload antes de enviar
      try {
        validatePayload(payload);
        console.log('✅ Payload validado com sucesso');
      } catch (validationError) {
        console.error('❌ Erro na validação do payload:', validationError);
        throw validationError;
      }

      // Função para tentar com retry
      const tryWithRetry = async (attempts = 3) => {
        for (let attempt = 1; attempt <= attempts; attempt++) {
          try {
            console.log(`🔄 Tentativa ${attempt}/${attempts} para gerar PIX...`);
            
            console.log('🌐 Chamando Edge Function syncpay-payment-v2...');
            const { data, error: supabaseError } = await supabase.functions.invoke('syncpay-payment-v2', {
              body: payload
            });
            
            console.log('📥 Supabase response:', { data, error: supabaseError });
            
            if (supabaseError) {
              console.error('❌ Erro do Supabase:', supabaseError);
              throw supabaseError;
            }
            
            console.log('✅ Supabase retornou dados:', data);
            return data;
          } catch (error) {
            console.error(`❌ Tentativa ${attempt} falhou:`, error);
            
            if (attempt === attempts) {
              throw error;
            }
            
            // Aguardar antes da próxima tentativa
            const delay = Math.pow(2, attempt) * 1000;
            console.log(`⏳ Aguardando ${delay}ms antes da próxima tentativa...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      };
      
      const data = await tryWithRetry();

      console.log('📥 Resposta da Edge Function:', data);
      console.log('📥 Tipo da resposta:', typeof data);
      console.log('📥 Resposta é null/undefined?', data === null || data === undefined);

      if (!data) {
        console.error('❌ Resposta vazia da Edge Function');
        throw new Error('Resposta vazia da Edge Function');
      }

      // Verificar se a resposta tem sucesso
      if (!data.success) {
        console.error('❌ Edge Function retornou erro:', data.error);
        throw new Error(data.error || 'Erro desconhecido na Edge Function');
      }

      // Retornar dados formatados
      const response: SyncPayResponse = {
        id: data.data?.idTransaction || data.data?.id || 'unknown',
        status: data.data?.status_transaction || data.data?.status || 'pending',
        pix_code: data.data?.paymentCode,
        pix_qr_code: data.data?.paymentCode,
        qr_code_base64: data.data?.paymentCodeBase64,
        qrCode: data.data?.paymentCode,
        transaction: data.data,
        urlWebHook: data.data?.urlWebHook
      };

      console.log('✅ Transação criada com sucesso:', response);
      return response;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('❌ Erro ao criar transação:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getPaymentDetails = async (transactionId: string): Promise<PaymentDetails> => {
    console.log('🔍 SYNCPAY V2 - Buscando detalhes da transação:', transactionId);
    
    try {
      // SyncPay V2 não possui endpoint público para buscar detalhes
      // Retornamos um placeholder para manter compatibilidade
      console.log('⚠️ SYNCPAY V2 - Endpoint de consulta não disponível');
      
      return {
        id: transactionId,
        status: 'WAITING_FOR_APPROVAL',
        pix_code: '',
        pix_qr_code: '',
        qr_code_base64: '',
      };
    } catch (err) {
      console.error('❌ SYNCPAY V2 - Erro ao buscar detalhes:', err);
      throw err;
    }
  };

  return {
    createTransaction,
    loading,
    error
  };
};

export type { SyncPayRequest, SyncPayResponse, SyncPayCustomer, SyncPayItem };
