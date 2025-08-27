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
  // checagens essenciais
  ensure(payload.ip, 'ip');
  ensure(payload.pix && payload.pix.expiresInDays, 'pix.expiresInDays');
  ensure(Array.isArray(payload.items) && payload.items.length > 0, 'items');
  payload.items.forEach((it: any, idx: number) => {
    ensure(it.title, `items[${idx}].title`);
    ensure(typeof it.quantity === 'number', `items[${idx}].quantity`);
    ensure(typeof it.tangible === 'boolean', `items[${idx}].tangible`);
    ensure(typeof it.unitPrice === 'number', `items[${idx}].unitPrice`);
  });
  ensure(typeof payload.amount === 'number', 'amount');
  ensure(payload.customer, 'customer');
  // campos do customer
  ['cpf','name','email','phone','externaRef','address'].forEach(key => ensure(payload.customer[key], `customer.${key}`));
  // address fields
  ['city','state','street','country','zipCode','neighborhood','streetNumber'].forEach(key =>
    ensure(payload.customer.address[key], `customer.address.${key}`)
  );
  ensure(payload.postbackUrl && payload.postbackUrl.startsWith('http'), 'postbackUrl (deve ser URL pública)');
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

      // Chamar a Edge Function syncpay-payment-v2
      const { data, error: supabaseError } = await supabase.functions.invoke('syncpay-payment-v2', {
        body: payload
      });

      console.log('📥 Resposta da Edge Function:', data);
      console.log('❌ Erro da Edge Function:', supabaseError);

      if (supabaseError) {
        console.error('❌ Erro na Edge Function:', supabaseError);
        throw new Error(`Erro na Edge Function: ${supabaseError.message}`);
      }

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
