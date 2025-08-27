import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, BarChart3, RefreshCw, LogOut, Target, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useOrdersDatabase, OrderData } from '@/hooks/useOrdersDatabase';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { formatPrice } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { RemarketingCampaigns } from '@/components/RemarketingCampaigns';
import { AdvancedMetricsDashboard } from '@/components/AdvancedMetricsDashboard';

const Admin = () => {
  const navigate = useNavigate();
  const { logout } = useAdminAuth();
  const { orders, loading, markExpiredOrders, getStats, refreshOrders, markOrderAsPaid } = useOrdersDatabase();
  const [filteredOrders, setFilteredOrders] = useState<OrderData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [verifyingPayments, setVerifyingPayments] = useState(false);
  const [pushLeads, setPushLeads] = useState<any[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const { toast } = useToast();

  // Debug: Log quando orders mudar
  useEffect(() => {
    console.log('📊 ADMIN: Orders atualizados:', orders.length, orders);
  }, [orders]);

  // Atualizar pedidos expirados ao carregar
  useEffect(() => {
    markExpiredOrders();
    loadPushLeads();
  }, []);

  // Carregar leads de push notifications
  const loadPushLeads = async () => {
    setLoadingLeads(true);
    try {
      const { data, error } = await supabase
        .from('push_subscription_leads')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPushLeads(data || []);
    } catch (error) {
      console.error('Erro ao carregar leads:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os leads de push notifications",
        variant: "destructive"
      });
    } finally {
      setLoadingLeads(false);
    }
  };

  // Forçar atualização da página
  const forceRefresh = async () => {
    console.log('📊 ADMIN: Refresh manual executado');
    await markExpiredOrders();
    await refreshOrders();
  };

  // Verificar status de todos os pagamentos pendentes
  const verifyAllPayments = async () => {
    setVerifyingPayments(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-all-pending-payments');
      
      if (error) {
        console.error('Erro ao verificar pagamentos:', error);
        toast({
          title: "Erro",
          description: "Erro ao verificar status dos pagamentos",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Verificação Concluída",
        description: data.message || "Status dos pagamentos atualizado com sucesso",
      });

      // Recarregar dados após verificação
      await refreshOrders();
      
    } catch (error) {
      console.error('Erro na verificação:', error);
      toast({
        title: "Erro",
        description: "Erro ao conectar com o serviço de verificação",
        variant: "destructive",
      });
    } finally {
      setVerifyingPayments(false);
    }
  };

  // Verificar status de um pagamento específico
  const verifySpecificPayment = async (transactionId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-payment-status', {
        body: { transactionId }
      });
      
      if (error) {
        console.error('Erro ao verificar pagamento:', error);
        toast({
          title: "Erro",
          description: "Erro ao verificar status do pagamento",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Status Atualizado",
        description: `Pagamento atualizado para: ${data.newStatus}`,
      });

      // Recarregar dados após verificação
      await refreshOrders();
      
    } catch (error) {
      console.error('Erro na verificação:', error);
      toast({
        title: "Erro",
        description: "Erro ao verificar pagamento específico",
        variant: "destructive",
      });
    }
  };

  // Marcar pedido como pago manualmente
  const handleMarkAsPaid = async (orderId: string, customerName: string) => {
    try {
      const success = await markOrderAsPaid(orderId);
      if (success) {
        toast({
          title: "✅ Pedido Atualizado",
          description: `Pedido de ${customerName} marcado como pago com sucesso!`,
        });
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível marcar o pedido como pago",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao marcar como pago:', error);
      toast({
        title: "Erro",
        description: "Erro ao marcar pedido como pago",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    let filtered = [...orders];

    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.phone.includes(searchTerm) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.transactionId && order.transactionId.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtro por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Filtro por data
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      if (dateFilter !== 'all') {
        filtered = filtered.filter(order => new Date(order.createdAt) >= filterDate);
      }
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter, dateFilter]);

  const stats = getStats();

  const getStatusBadge = (status: OrderData['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Aguardando</Badge>;
      case 'paid':
        return <Badge variant="outline" className="text-green-600 border-green-600">Pago</Badge>;
      case 'expired':
        return <Badge variant="outline" className="text-red-600 border-red-600">Expirado</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['ID', 'Cliente', 'Email', 'Telefone', 'Valor', 'Status', 'Criado em', 'ID Transação'].join(','),
      ...filteredOrders.map(order => [
        order.id,
        order.customer.name,
        order.customer.email,
        order.customer.phone,
        order.amount,
        order.status,
        formatDate(order.createdAt),
        order.transactionId || 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pedidos-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b py-4">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>VOLTAR</span>
            </button>
            <div className="w-12 h-12 bg-white border-2 rounded-full flex items-center justify-center shadow-sm" style={{ borderColor: '#0038FF' }}>
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Painel Administrativo</h1>
              <p className="text-sm text-gray-600">Auditoria de Pagamentos PIX</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={forceRefresh} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
            <Button 
              onClick={verifyAllPayments} 
              variant="outline" 
              disabled={verifyingPayments}
              className="text-blue-600 hover:text-blue-700"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${verifyingPayments ? 'animate-spin' : ''}`} />
              {verifyingPayments ? 'Verificando...' : 'Verificar Pagamentos'}
            </Button>
            <Button onClick={handleExportCSV} variant="outline">
              Exportar CSV
            </Button>
            <Button onClick={logout} variant="outline" className="text-red-600 hover:text-red-700">
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="orders" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Pedidos & Pagamentos</span>
            </TabsTrigger>
            <TabsTrigger value="leads" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Leads Push ({pushLeads.length})</span>
            </TabsTrigger>
            <TabsTrigger value="remarketing" className="flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <span>Campanhas</span>
            </TabsTrigger>
            <TabsTrigger value="metrics" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Métricas Avançadas</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-6">
            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Aguardando</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Pagos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Expirados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Valor Total Pago</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">R$ {formatPrice(stats.totalAmount)}</div>
                </CardContent>
              </Card>
            </div>

            {/* Filtros */}
            <Card>
              <CardHeader>
                <CardTitle>Filtros</CardTitle>
                <CardDescription>Filtre os pedidos por diferentes critérios</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Input
                      placeholder="Buscar por nome, email, telefone ou ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="pending">Aguardando</SelectItem>
                      <SelectItem value="paid">Pago</SelectItem>
                      <SelectItem value="expired">Expirado</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="today">Hoje</SelectItem>
                      <SelectItem value="week">Última semana</SelectItem>
                      <SelectItem value="month">Último mês</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setDateFilter('all');
                    }}
                    variant="outline"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Limpar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tabela de Pedidos */}
            <Card>
              <CardHeader>
                <CardTitle>Pedidos ({filteredOrders.length})</CardTitle>
                <CardDescription>Histórico completo de PIX gerados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Contato</TableHead>
                        <TableHead>Endereço</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Criado em</TableHead>
                        <TableHead>ID Transação</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                            Nenhum pedido encontrado
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredOrders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-mono text-xs">{order.id}</TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{order.customer.name}</div>
                                <div className="text-xs text-gray-500">{order.productName} (x{order.quantity})</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-xs">
                                <div>{order.customer.email}</div>
                                <div>{order.customer.phone}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-xs">
                                <div>{order.address.street}, {order.address.streetNumber}</div>
                                <div>{order.address.neighborhood} - {order.address.city}/{order.address.state}</div>
                                <div>CEP: {order.address.zipCode}</div>
                              </div>
                            </TableCell>
                            <TableCell className="font-bold">R$ {formatPrice(order.amount)}</TableCell>
                            <TableCell>{getStatusBadge(order.status)}</TableCell>
                            <TableCell className="text-xs">{formatDate(order.createdAt)}</TableCell>
                            <TableCell className="font-mono text-xs">
                              {order.transactionId || '-'}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button size="sm" variant="ghost" title="Ver detalhes">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                {order.status === 'pending' && order.transactionId && (
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={() => verifySpecificPayment(order.transactionId!)}
                                    title="Verificar status do pagamento"
                                  >
                                    <RefreshCw className="w-3 h-3" />
                                  </Button>
                                )}
                                {order.status === 'pending' && (
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={() => handleMarkAsPaid(order.id, order.customer.name)}
                                    title="Marcar como pago"
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                  >
                                    ✓
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leads" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Leads de Push Notifications ({pushLeads.length})
                </CardTitle>
                <CardDescription>
                  Clientes que aceitaram receber notificações push
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingLeads ? (
                  <div className="text-center py-8">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
                    <p>Carregando leads...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Telefone</TableHead>
                          <TableHead>Produto</TableHead>
                          <TableHead>Localização</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead>Comprou</TableHead>
                          <TableHead>Fonte</TableHead>
                          <TableHead>Criado em</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pushLeads.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                              Nenhum lead encontrado
                            </TableCell>
                          </TableRow>
                        ) : (
                          pushLeads.map((lead) => (
                            <TableRow key={lead.id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">
                                    {lead.customer_name || 'Não informado'}
                                  </div>
                                  {lead.customer_cpf && (
                                    <div className="text-xs text-muted-foreground">
                                      CPF: {lead.customer_cpf}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>{lead.customer_phone || 'Não informado'}</TableCell>
                              <TableCell>{lead.interested_product || 'Não especificado'}</TableCell>
                              <TableCell>
                                <div className="text-xs">
                                  {lead.customer_address_city && lead.customer_address_state 
                                    ? (
                                      <>
                                        <div>{lead.customer_address_city}, {lead.customer_address_state}</div>
                                        {lead.customer_address_neighborhood && (
                                          <div className="text-muted-foreground">{lead.customer_address_neighborhood}</div>
                                        )}
                                      </>
                                    )
                                    : 'Não informado'
                                  }
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={
                                  (lead.lead_quality_score || 1) >= 4 ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                                  (lead.lead_quality_score || 1) >= 3 ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' :
                                  'bg-red-100 text-red-800 hover:bg-red-100'
                                }>
                                  {lead.lead_quality_score || 1}/5
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {lead.has_made_purchase ? (
                                  <div className="text-green-600 font-medium">
                                    <div>✓ Sim</div>
                                    {lead.purchase_amount && (
                                      <div className="text-xs">R$ {lead.purchase_amount}</div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-gray-500">Não</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {lead.lead_source || 'notification_permission'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="remarketing" className="space-y-6">
            <RemarketingCampaigns />
          </TabsContent>

          <TabsContent value="metrics" className="space-y-6">
            <AdvancedMetricsDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;