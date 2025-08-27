-- Remover constraint existente
ALTER TABLE engagement_analytics DROP CONSTRAINT engagement_analytics_event_type_check;

-- Criar nova constraint com eventos adicionais
ALTER TABLE engagement_analytics ADD CONSTRAINT engagement_analytics_event_type_check 
CHECK (event_type = ANY (ARRAY[
  'page_view'::text,
  'button_click'::text, 
  'form_submit'::text,
  'search'::text,
  'download'::text,
  'purchase_completed'::text,
  'cart_abandoned'::text,
  'signup_completed'::text,
  'pushnotify_initialized'::text,
  'custom_event'::text,
  'user_interaction'::text,
  'form_started'::text,
  'site_entry'::text,
  'pix_generated'::text,
  'user_signup'::text,
  'notification_sent'::text
]));