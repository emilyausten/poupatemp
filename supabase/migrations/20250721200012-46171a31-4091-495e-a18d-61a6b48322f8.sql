-- Criar tabela para armazenar tokens de push notifications (leads)
CREATE TABLE public.push_subscription_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NULL,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  user_agent TEXT,
  ip_address INET,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_notification_sent TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Habilitar RLS
ALTER TABLE public.push_subscription_leads ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção de qualquer lugar (leads externos)
CREATE POLICY "Allow external lead insertion" 
ON public.push_subscription_leads 
FOR INSERT 
WITH CHECK (true);

-- Política para usuários autenticados verem seus próprios leads
CREATE POLICY "Users can view their own leads" 
ON public.push_subscription_leads 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

-- Política para atualizar leads próprios
CREATE POLICY "Users can update their own leads" 
ON public.push_subscription_leads 
FOR UPDATE 
USING (auth.uid() = user_id OR user_id IS NULL);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_push_subscription_leads_updated_at
BEFORE UPDATE ON public.push_subscription_leads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_push_leads_endpoint ON public.push_subscription_leads(endpoint);
CREATE INDEX idx_push_leads_user_id ON public.push_subscription_leads(user_id);
CREATE INDEX idx_push_leads_active ON public.push_subscription_leads(is_active);
CREATE INDEX idx_push_leads_created_at ON public.push_subscription_leads(created_at);

-- Tabela para campanhas de remarketing
CREATE TABLE public.remarketing_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  icon TEXT DEFAULT '/favicon.ico',
  badge TEXT DEFAULT '/favicon.ico',
  target_audience JSONB DEFAULT '{}',
  schedule_type TEXT NOT NULL DEFAULT 'immediate', -- immediate, scheduled, recurring
  scheduled_for TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sent_at TIMESTAMP WITH TIME ZONE,
  total_sent INTEGER DEFAULT 0,
  total_delivered INTEGER DEFAULT 0,
  total_clicked INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Habilitar RLS para campanhas
ALTER TABLE public.remarketing_campaigns ENABLE ROW LEVEL SECURITY;

-- Política para admins gerenciarem campanhas
CREATE POLICY "Allow admin campaign management" 
ON public.remarketing_campaigns 
FOR ALL 
USING (true);