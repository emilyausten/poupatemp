-- Remover constraint existente
ALTER TABLE public.engagement_analytics 
DROP CONSTRAINT IF EXISTS engagement_analytics_event_type_check;

-- Criar nova constraint incluindo automation_triggered
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
  'remarketing_campaign_clicked',
  'automation_triggered'
));