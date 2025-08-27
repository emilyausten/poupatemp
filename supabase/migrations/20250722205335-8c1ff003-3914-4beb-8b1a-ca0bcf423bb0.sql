-- Corrigir problemas de segurança: adicionar search_path às funções

-- Recriar função calculate_lead_quality_score com search_path seguro
CREATE OR REPLACE FUNCTION calculate_lead_quality_score(lead_record public.push_subscription_leads)
RETURNS INTEGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Recriar trigger function com search_path seguro
CREATE OR REPLACE FUNCTION update_lead_quality_score()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.lead_quality_score := calculate_lead_quality_score(NEW);
    RETURN NEW;
END;
$$;

-- Recriar função update_updated_at_column com search_path seguro
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;