import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp, Users, Bell, ShoppingCart, Target } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MetricsData {
  totalLeads: number;
  activeLeads: number;
  campaignsSent: number;
  conversionRate: number;
  engagementRate: number;
  trends: Array<{
    date: string;
    leads: number;
    campaigns: number;
    conversions: number;
  }>;
  deviceBreakdown: Array<{
    device: string;
    count: number;
    percentage: number;
  }>;
  locationData: Array<{
    city: string;
    count: number;
  }>;
  leadQualityDistribution: Array<{
    score: number;
    count: number;
  }>;
}

export const AdvancedMetricsDashboard = () => {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const COLORS = ['#488AFF', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      // Carregar leads
      const { data: leads, error: leadsError } = await supabase
        .from('push_subscription_leads')
        .select('*');

      if (leadsError) throw leadsError;

      // Carregar campanhas
      const { data: campaigns, error: campaignsError } = await supabase
        .from('remarketing_campaigns')
        .select('*');

      if (campaignsError) throw campaignsError;

      // Carregar analytics
      const { data: analytics, error: analyticsError } = await supabase
        .from('engagement_analytics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (analyticsError) throw analyticsError;

      // Processar dados
      const totalLeads = leads?.length || 0;
      const activeLeads = leads?.filter(l => l.is_active)?.length || 0;
      const campaignsSent = campaigns?.filter(c => c.sent_at)?.length || 0;
      
      // Calcular taxa de conversão (leads que fizeram compra)
      const conversions = leads?.filter(l => l.has_made_purchase)?.length || 0;
      const conversionRate = totalLeads > 0 ? (conversions / totalLeads) * 100 : 0;

      // Calcular engajamento (leads com eventos recentes)
      const recentEvents = analytics?.filter(a => {
        const eventDate = new Date(a.created_at);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return eventDate >= sevenDaysAgo;
      }) || [];
      const engagementRate = totalLeads > 0 ? (recentEvents.length / totalLeads) * 100 : 0;

      // Gerar tendências dos últimos 30 dias
      const trends = generateTrends(leads || [], campaigns || [], analytics || []);

      // Breakdown por dispositivo
      const deviceBreakdown = generateDeviceBreakdown(leads || []);

      // Dados por localização
      const locationData = generateLocationData(leads || []);

      // Distribuição de qualidade de leads
      const leadQualityDistribution = generateLeadQualityDistribution(leads || []);

      setMetrics({
        totalLeads,
        activeLeads,
        campaignsSent,
        conversionRate,
        engagementRate,
        trends,
        deviceBreakdown,
        locationData,
        leadQualityDistribution
      });

    } catch (error) {
      console.error('❌ Erro ao carregar métricas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as métricas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadMetrics();
  };

  const generateTrends = (leads: any[], campaigns: any[], analytics: any[]) => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    return last30Days.map(date => {
      const dayLeads = leads.filter(l => l.created_at?.startsWith(date)).length;
      const dayCampaigns = campaigns.filter(c => c.sent_at?.startsWith(date)).length;
      const dayConversions = analytics.filter(a => 
        a.created_at?.startsWith(date) && a.event_type === 'purchase_completed'
      ).length;

      return {
        date: new Date(date).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
        leads: dayLeads,
        campaigns: dayCampaigns,
        conversions: dayConversions
      };
    });
  };

  const generateDeviceBreakdown = (leads: any[]) => {
    const devices: Record<string, number> = {};
    
    leads.forEach(lead => {
      if (lead.user_agent) {
        let device = 'Desktop';
        if (lead.user_agent.includes('Mobile') || lead.user_agent.includes('Android') || lead.user_agent.includes('iPhone')) {
          device = 'Mobile';
        } else if (lead.user_agent.includes('Tablet') || lead.user_agent.includes('iPad')) {
          device = 'Tablet';
        }
        devices[device] = (devices[device] || 0) + 1;
      }
    });

    const total = leads.length;
    return Object.entries(devices).map(([device, count]) => ({
      device,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    }));
  };

  const generateLocationData = (leads: any[]) => {
    const cities: Record<string, number> = {};
    
    leads.forEach(lead => {
      if (lead.customer_address_city) {
        cities[lead.customer_address_city] = (cities[lead.customer_address_city] || 0) + 1;
      }
    });

    return Object.entries(cities)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  };

  const generateLeadQualityDistribution = (leads: any[]) => {
    const scores: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    leads.forEach(lead => {
      const score = lead.lead_quality_score || 1;
      scores[score] = (scores[score] || 0) + 1;
    });

    return Object.entries(scores).map(([score, count]) => ({
      score: parseInt(score),
      count
    }));
  };

  if (loading || !metrics) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">📊 Métricas Avançadas</h2>
          <Button disabled>
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            Carregando...
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">📊 Métricas Avançadas</h2>
        <Button 
          onClick={handleRefresh} 
          disabled={refreshing}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{metrics.totalLeads}</div>
            <Badge variant="secondary" className="mt-1">
              {metrics.activeLeads} ativos
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campanhas Enviadas</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.campaignsSent}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Notificações entregues
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {metrics.conversionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Leads que compraram
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engajamento</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {metrics.engagementRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Últimos 7 dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score Médio</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">
              {(metrics.leadQualityDistribution.reduce((acc, item) => acc + (item.score * item.count), 0) / metrics.totalLeads || 0).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Qualidade dos leads
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tendências */}
        <Card>
          <CardHeader>
            <CardTitle>📈 Tendências (30 dias)</CardTitle>
            <CardDescription>Leads, campanhas e conversões</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={metrics.trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="leads" stackId="1" stroke="#488AFF" fill="#488AFF" fillOpacity={0.6} />
                <Area type="monotone" dataKey="campaigns" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} />
                <Area type="monotone" dataKey="conversions" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Breakdown por Dispositivo */}
        <Card>
          <CardHeader>
            <CardTitle>📱 Dispositivos</CardTitle>
            <CardDescription>Distribuição por tipo de dispositivo</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={metrics.deviceBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ device, percentage }) => `${device} ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {metrics.deviceBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Cidades */}
        <Card>
          <CardHeader>
            <CardTitle>🏙️ Top Cidades</CardTitle>
            <CardDescription>Leads por localização</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.locationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="city" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#488AFF" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Qualidade de Leads */}
        <Card>
          <CardHeader>
            <CardTitle>⭐ Qualidade dos Leads</CardTitle>
            <CardDescription>Distribuição por score de qualidade</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.leadQualityDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="score" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 