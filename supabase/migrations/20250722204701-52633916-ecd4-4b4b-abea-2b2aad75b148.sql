-- Atualizar tabela push_subscription_leads para incluir dados completos do cliente
ALTER TABLE public.push_subscription_leads 
ADD COLUMN customer_name TEXT,
ADD COLUMN customer_phone TEXT,
ADD COLUMN customer_address_street TEXT,
ADD COLUMN customer_address_number TEXT,
ADD COLUMN customer_address_complement TEXT,
ADD COLUMN customer_address_neighborhood TEXT,
ADD COLUMN customer_address_city TEXT,
ADD COLUMN customer_address_state TEXT,
ADD COLUMN customer_address_zip_code TEXT,
ADD COLUMN customer_address_country TEXT DEFAULT 'Brasil',
ADD COLUMN customer_cpf TEXT,
ADD COLUMN interested_product TEXT,
ADD COLUMN has_made_purchase BOOLEAN DEFAULT false,
ADD COLUMN purchase_amount DECIMAL,
ADD COLUMN last_purchase_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN lead_source TEXT, -- 'notification_permission', 'form_fill', 'purchase', etc
ADD COLUMN lead_quality_score INTEGER DEFAULT 1; -- 1-5 score based on data completeness

-- Criar índices para melhorar performance em consultas
CREATE INDEX idx_push_leads_customer_phone ON public.push_subscription_leads(customer_phone);
CREATE INDEX idx_push_leads_customer_cpf ON public.push_subscription_leads(customer_cpf);
CREATE INDEX idx_push_leads_purchase_status ON public.push_subscription_leads(has_made_purchase);
CREATE INDEX idx_push_leads_quality_score ON public.push_subscription_leads(lead_quality_score);
CREATE INDEX idx_push_leads_source ON public.push_subscription_leads(lead_source);

-- Função para calcular score de qualidade do lead baseado na completude dos dados
CREATE OR REPLACE FUNCTION calculate_lead_quality_score(lead_record public.push_subscription_leads)
RETURNS INTEGER AS $$
DECLARE
    score INTEGER := 1;
BEGIN
    -- Base score para aceitar notificações
    score := 1;
    
    -- +1 para ter nome
    IF lead_record.customer_name IS NOT NULL AND length(trim(lead_record.customer_name)) > 0 THEN
        score := score + 1;
    END IF;
    
    -- +1 para ter telefone
    IF lead_record.customer_phone IS NOT NULL AND length(trim(lead_record.customer_phone)) > 0 THEN
        score := score + 1;
    END IF;
    
    -- +1 para ter endereço completo
    IF lead_record.customer_address_street IS NOT NULL 
       AND lead_record.customer_address_city IS NOT NULL 
       AND lead_record.customer_address_state IS NOT NULL THEN
        score := score + 1;
    END IF;
    
    -- +1 para ter feito uma compra
    IF lead_record.has_made_purchase = true THEN
        score := score + 1;
    END IF;
    
    RETURN LEAST(score, 5); -- Máximo score é 5
END;
$$ LANGUAGE plpgsql;

-- Trigger para calcular automaticamente o score quando dados são inseridos/atualizados
CREATE OR REPLACE FUNCTION update_lead_quality_score()
RETURNS TRIGGER AS $$
BEGIN
    NEW.lead_quality_score := calculate_lead_quality_score(NEW);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger
CREATE TRIGGER trigger_update_lead_quality_score
    BEFORE INSERT OR UPDATE ON public.push_subscription_leads
    FOR EACH ROW EXECUTE FUNCTION update_lead_quality_score();

-- Atualizar leads existentes com source padrão
UPDATE public.push_subscription_leads 
SET lead_source = 'notification_permission' 
WHERE lead_source IS NULL;