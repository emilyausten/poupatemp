import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send, Users, Target, Calendar, Smartphone, Monitor, Globe, MapPin } from 'lucide-react';
import { Tabs as TabsContainer, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Lead {
  id: string;
  endpoint: string;
  user_agent: string;
  referrer: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  created_at: string;
  last_notification_sent: string;
  is_active: boolean;
}

interface Campaign {
  id: string;
  name: string;
  title: string;
  body: string;
  schedule_type: string;
  created_at: string;
  sent_at: string;
  total_sent: number;
  total_delivered: number;
  total_clicked: number;
  is_active: boolean;
}

export const RemarketingCampaigns = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [sendingToLead, setSendingToLead] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<string>('1');
  const { toast } = useToast();

  // Mensagens predefinidas
  const predefinedMessages = {
    '1': {
      title: '🔔 Boas-vindas',
      body: '👋 Olá! Bem-vindo ao Poupa — o jeito mais fácil de agendar seus documentos sem filas e sem stress. Vamos agilizar seu atendimento agora mesmo?'
    },
    '2': {
      title: '🔔 Início do agendamento',
      body: '📅 Agendamentos disponíveis de segunda a sexta, das 9h às 18h. Clique abaixo para iniciar o seu agora mesmo e garantir seu atendimento!'
    },
    '3': {
      title: '🔔 Após preencher os dados pessoais',
      body: '✅ Dados recebidos! Agora vamos gerar sua guia de pagamento via PIX. Isso garante o seu agendamento de forma rápida e segura.'
    },
    '4': {
      title: '🔔 Guia de pagamento emitida',
      body: '💳 Sua guia de pagamento foi gerada! Para confirmar o seu agendamento, realize o pagamento via PIX o quanto antes. ⏰ Válida por tempo limitado.'
    },
    '5': {
      title: '🔔 Pagamento confirmado',
      body: '🎉 Pagamento confirmado com sucesso! Seu agendamento está garantido. Em instantes, você receberá todos os detalhes.'
    },
    '6': {
      title: '🔔 Confirmação do agendamento',
      body: '📍 Tudo certo! Seu atendimento está agendado. 📅 Data e horário: [DATA/HORÁRIO] 📌 Endereço e informações completas foram enviadas para seu e-mail.'
    }
  };

  // Estados do formulário
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    body: '',
    schedule_type: 'immediate'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar leads via GET
      try {
        const response = await fetch(`https://werfsbezbsprestfpsxd.supabase.co/functions/v1/manage-push-leads/get-leads`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlcmZzYmV6YnNwcmVzdGZwc3hkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MzQ2OTIsImV4cCI6MjA2NzUxMDY5Mn0.MElbqL3IrwYClRjgHXESBeIgNq8iWbBptm5NR46gO6A`,
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlcmZzYmV6YnNwcmVzdGZwc3hkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MzQ2OTIsImV4cCI6MjA2NzUxMDY5Mn0.MElbqL3IrwYClRjgHXESBeIgNq8iWbBptm5NR46gO6A',
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const leadsResponse = await response.json();
        setLeads(leadsResponse.leads || []);
        
      } catch (leadsError) {
        console.error('Erro ao carregar leads:', leadsError);
        setLeads([]);
      }

      // Carregar campanhas
      const { data: campaignsData, error: campaignsError } = await supabase
        .from('remarketing_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (campaignsError) {
        console.error('Erro ao carregar campanhas:', campaignsError);
      } else {
        setCampaigns(campaignsData || []);
      }

    } catch (error) {
      console.error('Erro geral ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const { data, error } = await supabase.functions.invoke('manage-push-leads/create-campaign', {
        body: formData
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso!",
        description: `Campanha "${formData.name}" criada${formData.schedule_type === 'immediate' ? ' e enviada' : ''} com sucesso!`,
      });

      // Resetar formulário
      setFormData({
        name: '',
        title: '',
        body: '',
        schedule_type: 'immediate'
      });
      setShowCreateForm(false);

      // Recarregar dados
      await loadData();

    } catch (error: any) {
      console.error('Erro ao criar campanha:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar campanha",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleSendCampaign = async (campaignId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('manage-push-leads/send-campaign', {
        body: { campaign_id: campaignId }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso!",
        description: `Campanha enviada para ${data.sent_result.sent} leads!`,
      });

      await loadData();

    } catch (error: any) {
      console.error('Erro ao enviar campanha:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao enviar campanha",
        variant: "destructive",
      });
    }
  };

  const handleSendToLead = async (leadId: string) => {
    try {
      setSendingToLead(leadId);
      
      const message = predefinedMessages[selectedMessage as keyof typeof predefinedMessages];
      
      const { data, error } = await supabase.functions.invoke('manage-push-leads/send-to-lead', {
        body: { 
          lead_id: leadId,
          title: message.title,
          body: message.body
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso!",
        description: `Mensagem "${message.title}" enviada com sucesso!`,
      });

    } catch (error: any) {
      console.error('Erro ao enviar notificação:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao enviar notificação",
        variant: "destructive",
      });
    } finally {
      setSendingToLead(null);
    }
  };

  const getDeviceIcon = (userAgent: string) => {
    if (!userAgent) return <Monitor className="h-4 w-4" />;
    if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
      return <Smartphone className="h-4 w-4" />;
    }
    return <Monitor className="h-4 w-4" />;
  };

  const getDeviceInfo = (userAgent: string) => {
    if (!userAgent) return 'Dispositivo Desconhecido';
    
    if (userAgent.includes('iPhone')) return 'iPhone';
    if (userAgent.includes('iPad')) return 'iPad';
    if (userAgent.includes('Android')) {
      if (userAgent.includes('Mobile')) return 'Android Mobile';
      return 'Android Tablet';
    }
    if (userAgent.includes('Windows')) return 'Windows PC';
    if (userAgent.includes('Mac')) return 'Mac';
    if (userAgent.includes('Linux')) return 'Linux PC';
    if (userAgent.includes('Mobile')) return 'Mobile';
    
    return 'Desktop';
  };

  const getBrowserInfo = (userAgent: string) => {
    if (!userAgent) return '';
    
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Opera')) return 'Opera';
    
    return 'Navegador';
  };

  const getUniqueId = (lead: Lead) => {
    // Gera um ID único baseado no endpoint e user agent para identificar o aparelho
    const hash = lead.endpoint.slice(-8) + (lead.user_agent ? lead.user_agent.slice(0, 4) : '');
    return hash.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leads.length}</div>
            <p className="text-xs text-muted-foreground">
              {leads.filter(lead => lead.is_active).length} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campanhas</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns.length}</div>
            <p className="text-xs text-muted-foreground">
              {campaigns.filter(c => c.sent_at).length} enviadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enviado</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.reduce((sum, c) => sum + (c.total_sent || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">notificações</p>
          </CardContent>
        </Card>
      </div>

      {/* Navegação por abas */}
      <TabsContainer defaultValue="campaigns" className="w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Sistema de Remarketing</h2>
          <Button 
            onClick={() => setShowCreateForm(true)}
            disabled={leads.length === 0}
          >
            Nova Campanha
          </Button>
        </div>
        
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
          <TabsTrigger value="leads">Leads ({leads.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-6">

      {leads.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Nenhum lead capturado ainda. Os leads serão coletados automaticamente quando os usuários permitirem notificações.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Formulário de criação */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nova Campanha de Remarketing</CardTitle>
            <CardDescription>
              Crie uma campanha para enviar notificações aos leads capturados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome da Campanha</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Oferta Especial de Verão"
                  required
                />
              </div>

              <div>
                <Label htmlFor="title">Título da Notificação</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: 🔥 Oferta Especial!"
                  required
                />
              </div>

              <div>
                <Label htmlFor="body">Conteúdo da Notificação</Label>
                <Textarea
                  id="body"
                  value={formData.body}
                  onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                  placeholder="Ex: Aproveite 50% de desconto em todos os serviços!"
                  required
                />
              </div>

              <div>
                <Label htmlFor="schedule_type">Tipo de Envio</Label>
                <Select 
                  value={formData.schedule_type} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, schedule_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Enviar Imediatamente</SelectItem>
                    <SelectItem value="scheduled">Agendar para Depois</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-2">
                <Button type="submit" disabled={creating}>
                  {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {formData.schedule_type === 'immediate' ? 'Criar e Enviar' : 'Criar Campanha'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de campanhas */}
      <div className="space-y-4">
        {campaigns.map((campaign) => (
          <Card key={campaign.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{campaign.name}</CardTitle>
                  <CardDescription className="mt-2">
                    <strong>Título:</strong> {campaign.title}<br />
                    <strong>Conteúdo:</strong> {campaign.body}
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Badge variant={campaign.sent_at ? "default" : "secondary"}>
                    {campaign.sent_at ? "Enviada" : "Pendente"}
                  </Badge>
                  {!campaign.sent_at && (
                    <Button 
                      size="sm" 
                      onClick={() => handleSendCampaign(campaign.id)}
                    >
                      <Send className="h-4 w-4 mr-1" />
                      Enviar
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Criada em</p>
                  <p>{new Date(campaign.created_at).toLocaleDateString('pt-BR')}</p>
                </div>
                {campaign.sent_at && (
                  <div>
                    <p className="text-muted-foreground">Enviada em</p>
                    <p>{new Date(campaign.sent_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground">Total Enviado</p>
                  <p>{campaign.total_sent || 0}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tipo</p>
                  <p className="capitalize">{campaign.schedule_type}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {campaigns.length === 0 && leads.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Nenhuma campanha criada ainda. Crie sua primeira campanha para começar a enviar notificações aos seus leads!
            </p>
          </CardContent>
        </Card>
      )}
        </TabsContent>

        <TabsContent value="leads" className="space-y-6">
          {leads.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  Nenhum lead capturado ainda. Os leads serão coletados automaticamente quando os usuários permitirem notificações.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Lista de Aparelhos</CardTitle>
                  <CardDescription>
                    Cada entrada representa um aparelho único que autorizou notificações
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Seletor de mensagem */}
                  <div className="border-b pb-4">
                    <Label htmlFor="message-select">Selecione a mensagem para enviar:</Label>
                    <Select value={selectedMessage} onValueChange={setSelectedMessage}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(predefinedMessages).map(([key, message]) => (
                          <SelectItem key={key} value={key}>
                            {message.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground mt-2">
                      {predefinedMessages[selectedMessage as keyof typeof predefinedMessages]?.body}
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    {leads.map((lead) => (
                      <div key={lead.id} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                            {getDeviceIcon(lead.user_agent)}
                          </div>
                          
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="font-mono">
                                ID: {getUniqueId(lead)}
                              </Badge>
                              <Badge variant={lead.is_active ? "default" : "secondary"}>
                                {lead.is_active ? "Ativo" : "Inativo"}
                              </Badge>
                            </div>
                            
                            <div className="space-y-1">
                              <p className="font-medium text-sm">
                                {getDeviceInfo(lead.user_agent)} • {getBrowserInfo(lead.user_agent)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                📅 Capturado: {formatDate(lead.created_at)}
                              </p>
                              {lead.last_notification_sent && (
                                <p className="text-xs text-muted-foreground">
                                  🔔 Última notificação: {formatDate(lead.last_notification_sent)}
                                </p>
                              )}
                            </div>
                            
                            <div className="flex flex-wrap gap-1">
                              {lead.utm_source && (
                                <Badge variant="outline" className="text-xs">
                                  <Globe className="h-3 w-3 mr-1" />
                                  {lead.utm_source}
                                </Badge>
                              )}
                              {lead.utm_campaign && (
                                <Badge variant="outline" className="text-xs">
                                  {lead.utm_campaign}
                                </Badge>
                              )}
                              {lead.referrer && (
                                <Badge variant="outline" className="text-xs">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {new URL(lead.referrer).hostname}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <Button
                          size="sm"
                          onClick={() => handleSendToLead(lead.id)}
                          disabled={!lead.is_active || sendingToLead === lead.id}
                          className="ml-4"
                        >
                          {sendingToLead === lead.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-1" />
                              Enviar
                            </>
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </TabsContainer>
    </div>
  );
};