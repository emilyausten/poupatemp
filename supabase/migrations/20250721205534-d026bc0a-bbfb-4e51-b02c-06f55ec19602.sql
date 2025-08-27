-- Primeiro, vamos ver quais event_types existem atualmente na tabela
SELECT DISTINCT event_type FROM public.engagement_analytics;

-- Deletar registros com event_types inválidos
DELETE FROM public.engagement_analytics 
WHERE event_type NOT IN (
  'page_view',
  'site_entry', 
  'form_started',
  'form_completed',
  'pix_generated',
  'payment_confirmed',
  'pushnotify_initialized',
  'push_lead_captured',
  'push_notification_sent',
  'push_notification_clicked',
  'push_notification_delivered',
  'remarketing_campaign_sent',
  'remarketing_campaign_clicked'
);

-- Agora aplicar a constraint
ALTER TABLE public.engagement_analytics 
ADD CONSTRAINT engagement_analytics_event_type_check 
CHECK (event_type IN (
  'page_view',
  'site_entry', 
  'form_started',
  'form_completed',
  'pix_generated',
  'payment_confirmed',
  'pushnotify_initialized',
  'push_lead_captured',
  'push_notification_sent',
  'push_notification_clicked',
  'push_notification_delivered',
  'remarketing_campaign_sent',
  'remarketing_campaign_clicked'
));