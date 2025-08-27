import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface OrderData {
  id: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    cpf: string;
  };
  address: {
    street: string;
    streetNumber: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    complement?: string;
    country?: string;
  };
  productName: string;
  quantity: number;
  amount: number;
  status: 'pending' | 'paid' | 'expired';
  createdAt: string;
  transactionId?: string;
  pixCode?: string;
}

export const useOrdersDatabase = () => {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(false);

  // Carregar dados reais do Supabase - SEM LIMITE
  const fetchOrders = async () => {
    setLoading(true);
    try {
      let allOrders: any[] = [];
      let start = 0;
      const batchSize = 1000;
      let hasMore = true;

      // Buscar todos os registros em lotes para contornar o limite do Supabase
      while (hasMore) {
        const { data, error } = await supabase
          .from('pix_orders')
          .select('*')
          .order('created_at', { ascending: false })
          .range(start, start + batchSize - 1);

        if (error) {
          console.error('Erro ao buscar pedidos:', error);
          break;
        }

        if (data && data.length > 0) {
          allOrders = [...allOrders, ...data];
          start += batchSize;
          
          // Se retornou menos que o batch size, não há mais dados
          if (data.length < batchSize) {
            hasMore = false;
          }
        } else {
          hasMore = false;
        }
      }

      console.log(`📊 ADMIN: Carregados ${allOrders.length} pedidos do banco de dados`);

      const formattedOrders: OrderData[] = allOrders.map(order => ({
        id: order.id,
        customer: {
          name: order.customer_name,
          email: order.customer_email,
          phone: order.customer_phone,
          cpf: order.customer_cpf
        },
        address: {
          street: order.address_street || '',
          streetNumber: order.address_street_number || '',
          neighborhood: order.address_neighborhood || '',
          city: order.address_city || '',
          state: order.address_state || '',
          zipCode: order.address_zip_code || '',
          complement: order.address_complement || '',
          country: order.address_country || 'Brasil'
        },
        productName: order.product_name,
        quantity: order.quantity,
        amount: Number(order.amount) * 100, // Converter para centavos
        status: order.status as 'pending' | 'paid' | 'expired',
        createdAt: order.created_at,
        transactionId: order.transaction_id || undefined,
        pixCode: order.pix_code || undefined
      }));

      setOrders(formattedOrders);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const markExpiredOrders = async () => {
    try {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      const { error } = await supabase
        .from('pix_orders')
        .update({ status: 'expired' })
        .eq('status', 'pending')
        .lt('created_at', oneDayAgo.toISOString());

      if (error) {
        console.error('Erro ao marcar pedidos expirados:', error);
      } else {
        // Recarregar dados após atualização
        await fetchOrders();
      }
    } catch (error) {
      console.error('Erro ao marcar pedidos expirados:', error);
    }
  };

  const refreshOrders = async () => {
    await fetchOrders();
  };

  const getStats = () => {
    const total = orders.length;
    const pending = orders.filter(o => o.status === 'pending').length;
    const paid = orders.filter(o => o.status === 'paid').length;
    const expired = orders.filter(o => o.status === 'expired').length;
    const totalAmount = orders
      .filter(o => o.status === 'paid')
      .reduce((sum, o) => sum + o.amount, 0);

    return {
      total,
      pending,
      paid,
      expired,
      totalAmount
    };
  };

  // Função para marcar um pedido como pago manualmente
  const markOrderAsPaid = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('pix_orders')
        .update({ 
          status: 'paid',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) {
        console.error('Erro ao marcar pedido como pago:', error);
        throw error;
      } else {
        console.log(`✅ Pedido ${orderId} marcado como pago manualmente`);
        // Recarregar dados após atualização
        await fetchOrders();
        return true;
      }
    } catch (error) {
      console.error('Erro ao marcar pedido como pago:', error);
      return false;
    }
  };

  return {
    orders,
    loading,
    markExpiredOrders,
    getStats,
    refreshOrders,
    fetchOrders,
    markOrderAsPaid
  };
};