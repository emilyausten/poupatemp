# Migração SyncPay para API V2

## Resumo das Mudanças

Este documento registra as alterações realizadas para migrar da API antiga da SyncPay para a nova API V2.

## Credenciais Atualizadas

### Antigas (V1)
- API Key: Configurada via variável de ambiente `SYNCPAY_API_KEY`
- Autenticação: Basic Auth com API Key codificada em Base64

### Novas (V2)
- Client ID: `7a7ef813-bf52-4b40-b452-b57a2f89e766`
- Client Secret: `406397e0-07e3-46dc-b0ce-2cb658fb6dac`
- Autenticação: Bearer Token com Client ID e Client Secret

## Mudanças na Estrutura do Payload

### Antiga (V1)
```json
{
  "amount": 10.00,
  "customer": {
    "name": "João Silva",
    "email": "joao@example.com",
    "cpf": "12345678901",
    "phone": "11987654321",
    "externaRef": "REF123456",
    "address": {
      "street": "Rua das Flores",
      "streetNumber": "123",
      "complement": "Apto 101",
      "zipCode": "01234-567",
      "neighborhood": "Centro",
      "city": "São Paulo",
      "state": "SP",
      "country": "br"
    }
  },
  "checkout": {
    "utm_source": "poupatempo_app",
    "utm_medium": "app_mobile",
    "utm_campaign": "agendamento_servicos",
    "utm_term": "servico",
    "utm_content": "pagamento_pix_checkout"
  },
  "pix": {
    "expiresInDays": 2
  },
  "items": [{
    "title": "Serviço Poupatempo",
    "quantity": 1,
    "unitPrice": 10.00,
    "tangible": true
  }],
  "postbackUrl": "https://exemplo.com/webhook",
  "metadata": "Agendamento Serviço - Cliente: Cliente (ref: ref_123)",
  "traceable": true,
  "ip": "127.0.0.1",
  "reference": "ref_123"
}
```

### Nova (V2)
```json
{
  "ip": "127.0.0.1",
  "pix": {
    "expiresInDays": "2024-12-31"
  },
  "items": [{
    "title": "Serviço Poupatempo",
    "quantity": 1,
    "tangible": true,
    "unitPrice": 10.00
  }],
  "amount": 10.00,
  "customer": {
    "cpf": "12345678901",
    "name": "João Silva",
    "email": "joao@example.com",
    "phone": "11987654321",
    "externaRef": "REF123456",
    "address": {
      "city": "São Paulo",
      "state": "SP",
      "street": "Rua das Flores",
      "country": "BR",
      "zipCode": "01234-567",
      "complement": "Apto 101",
      "neighborhood": "Centro",
      "streetNumber": "123"
    }
  },
  "metadata": {
    "provider": "PoupatempoApp",
    "sell_url": "https://poupatempo.app",
    "order_url": "https://poupatempo.app/order",
    "user_email": "joao@example.com",
    "user_identitication_number": "12345678901"
  },
  "traceable": true,
  "postbackUrl": "https://poupatempo.app/webhook"
}
```

## Principais Diferenças

1. **Estrutura do metadata**: Agora é um objeto estruturado em vez de string
2. **Campo `ip`**: Movido para o topo do payload
3. **Campo `pix.expiresInDays`**: Agora é string em vez de número
4. **Remoção do campo `checkout`**: Não mais necessário
5. **Campo `country`**: Agora usa "BR" em vez de "br"
6. **Campo `reference`**: Removido (usando `externaRef` no customer)

## Mudanças na Resposta

### Antiga (V1)
```json
{
  "status": "success",
  "idTransaction": "680a566b-0f40-497a-ad20-f0e6a6e369e4",
  "status_transaction": "pending",
  "paymentCode": "00020126820014br.gov.bcb...",
  "paymentCodeBase64": "MDAwMjAxMjY4MgAwMTRici5nb3YuYmNiLnBpeDI1NjBwaXgudHJlZWFsLmNvbS9xcid2My9h2C9mYzhiNDUxZS1lZjgwLTRhNzYtYWE5Ny1jZjU3OWI3ZTAaMmU1MjA0MDAwMDUzMDM5ODY1ODAyQlI1OTA4U1lOQ19QQVk2MDA5Tk9WT19HQU1BNjIwNzA1MDMqKio1MzA0OTBFQw=="
}
```

### Nova (V2)
```json
{
  "status": "success",
  "message": "ok",
  "client_id": "",
  "urlWebHook": "https://webhook.site/7b6e1248-eb5d-40e0-9f8e-6eb28becd2d0",
  "paymentCode": "00020126820014br.gov.bcb...",
  "idTransaction": "680a566b-0f40-497a-ad20-f0e6a6e369e4",
  "paymentCodeBase64": "MDAwMjAxMjY4MgAwMTRici5nb3YuYmNiLnBpeDI1NjBwaXgudHJlZWFsLmNvbS9xcid2My9h2C9mYzhiNDUxZS1lZjgwLTRhNzYtYWE5Ny1jZjU3OWI3ZTAaMmU1MjA0MDAwMDUzMDM5ODY1ODAyQlI1OTA4U1lOQ19QQVk2MDA5Tk9WT19HQU1BNjIwNzA1MDMqKio1MzA0OTBFQw==",
  "status_transaction": "WAITING_FOR_APPROVAL"
}
```

## Arquivos Modificados

1. **`supabase/functions/syncpay-payment/index.ts`**
   - Atualizada autenticação para usar Client ID e Client Secret
   - Modificado payload para conformar com nova API
   - Atualizada estrutura de resposta

2. **`src/hooks/useSyncPay.ts`**
   - Atualizadas interfaces para nova estrutura
   - Modificado mapeamento de payload
   - Atualizada normalização de resposta

3. **`supabase/functions/verify-payment-status/index.ts`**
   - Atualizado status padrão para "WAITING_FOR_APPROVAL"
   - Removida referência à API key antiga

4. **`supabase/functions/check-all-pending-payments/index.ts`**
   - Atualizado status padrão para "WAITING_FOR_APPROVAL"
   - Removida referência à API key antiga

## Status de Transação

### Antigo
- `pending`: Aguardando pagamento

### Novo
- `WAITING_FOR_APPROVAL`: Aguardando aprovação do pagamento
- `expired`: Pagamento expirado (após 30 minutos)

## Testes Recomendados

1. **Teste de Criação de Transação**
   - Verificar se o payload está sendo enviado corretamente
   - Confirmar se a autenticação está funcionando
   - Validar se a resposta está sendo processada adequadamente

2. **Teste de Verificação de Status**
   - Verificar se os status estão sendo atualizados corretamente
   - Confirmar se a expiração está funcionando após 30 minutos

3. **Teste de Compatibilidade**
   - Verificar se o frontend ainda funciona com as mudanças
   - Confirmar se os QR codes estão sendo exibidos corretamente

## Rollback

Em caso de problemas, é possível reverter as mudanças:

1. Restaurar as credenciais antigas
2. Reverter a estrutura do payload
3. Restaurar a autenticação Basic Auth
4. Reverter os status de transação

## Notas Importantes

- As credenciais estão hardcoded no código por simplicidade
- Em produção, considere usar variáveis de ambiente
- A API V2 não possui endpoint de consulta individual de transações
- O status de expiração é baseado apenas no tempo (30 minutos)
