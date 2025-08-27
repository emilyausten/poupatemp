-- Limpar dados de teste/lixo da tabela pix_orders
DELETE FROM pix_orders 
WHERE customer_name ILIKE '%agendamento%' 
   OR customer_name ILIKE '%poupatempo%'
   OR customer_email ILIKE '%cliente-%'
   OR id::text ILIKE '%cliente-%';