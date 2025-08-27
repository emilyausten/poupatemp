# Uso Dual da SyncPay - V1 e V2

## 📋 **Resumo**

Este documento explica como usar ambas as versões da API da SyncPay no mesmo projeto Supabase.

## 🏗️ **Estrutura Criada**

### **Edge Functions:**
- `syncpay-payment` - API V1 (original)
- `syncpay-payment-v2` - API V2 (nova)

### **Hooks:**
- `useSyncPay` - Para API V1
- `useSyncPayV2` - Para API V2

## 🚀 **Como Usar**

### **1. Usando a API V1 (Original):**

```typescript
import { useSyncPay } from '@/hooks/useSyncPay';

const PagamentoV1 = () => {
  const { createTransaction, loading, error } = useSyncPay();

  const handlePayment = async () => {
    try {
      const result = await createTransaction({
        postbackUrl: `${window.location.origin}/payment-webhook`,
        paymentMethod: "pix",
        customer: {
          name: "João Silva",
          email: "joao@email.com",
          phone: "11987654321",
          document: {
            number: "12345678901",
            type: "cpf"
          }
        },
        shipping: {
          fee: 0,
          address: {
            street: "Rua das Flores",
            streetNumber: "123",
            zipCode: "01234-567",
            neighborhood: "Centro",
            city: "São Paulo",
            state: "SP",
            country: "Brasil",
            complement: ""
          }
        },
        items: [{
          title: "Serviço Teste",
          description: "Descrição do serviço",
          unitPrice: 10.00,
          quantity: 1,
          tangible: true
        }],
        isInfoProducts: false
      });

      console.log('PIX V1 gerado:', result);
    } catch (error) {
      console.error('Erro V1:', error);
    }
  };

  return (
    <div>
      <button onClick={handlePayment} disabled={loading}>
        {loading ? 'Gerando PIX V1...' : 'Gerar PIX V1'}
      </button>
      {error && <p>Erro: {error}</p>}
    </div>
  );
};
```

### **2. Usando a API V2 (Nova):**

```typescript
import { useSyncPayV2 } from '@/hooks/useSyncPayV2';

const PagamentoV2 = () => {
  const { createTransaction, loading, error } = useSyncPayV2();

  const handlePayment = async () => {
    try {
      const result = await createTransaction({
        postbackUrl: `${window.location.origin}/payment-webhook`,
        paymentMethod: "pix",
        customer: {
          name: "João Silva",
          email: "joao@email.com",
          phone: "11987654321",
          document: {
            number: "12345678901",
            type: "cpf"
          }
        },
        shipping: {
          fee: 0,
          address: {
            street: "Rua das Flores",
            streetNumber: "123",
            zipCode: "01234-567",
            neighborhood: "Centro",
            city: "São Paulo",
            state: "SP",
            country: "Brasil",
            complement: ""
          }
        },
        items: [{
          title: "Serviço Teste V2",
          description: "Descrição do serviço V2",
          unitPrice: 10.00,
          quantity: 1,
          tangible: true
        }],
        isInfoProducts: false
      });

      console.log('PIX V2 gerado:', result);
    } catch (error) {
      console.error('Erro V2:', error);
    }
  };

  return (
    <div>
      <button onClick={handlePayment} disabled={loading}>
        {loading ? 'Gerando PIX V2...' : 'Gerar PIX V2'}
      </button>
      {error && <p>Erro: {error}</p>}
    </div>
  );
};
```

### **3. Usando Ambas em uma Página:**

```typescript
import { useSyncPay } from '@/hooks/useSyncPay';
import { useSyncPayV2 } from '@/hooks/useSyncPayV2';

const PagamentoDual = () => {
  const { createTransaction: createV1, loading: loadingV1, error: errorV1 } = useSyncPay();
  const { createTransaction: createV2, loading: loadingV2, error: errorV2 } = useSyncPayV2();

  const handlePaymentV1 = async () => {
    // Lógica para V1
  };

  const handlePaymentV2 = async () => {
    // Lógica para V2
  };

  return (
    <div>
      <div>
        <h3>API V1 (Original)</h3>
        <button onClick={handlePaymentV1} disabled={loadingV1}>
          {loadingV1 ? 'Gerando PIX V1...' : 'Gerar PIX V1'}
        </button>
        {errorV1 && <p>Erro V1: {errorV1}</p>}
      </div>

      <div>
        <h3>API V2 (Nova)</h3>
        <button onClick={handlePaymentV2} disabled={loadingV2}>
          {loadingV2 ? 'Gerando PIX V2...' : 'Gerar PIX V2'}
        </button>
        {errorV2 && <p>Erro V2: {errorV2}</p>}
      </div>
    </div>
  );
};
```

## 🔧 **Deploy das Edge Functions**

### **Deploy da V1 (já existente):**
```bash
npx supabase functions deploy syncpay-payment
```

### **Deploy da V2 (nova):**
```bash
npx supabase functions deploy syncpay-payment-v2
```

### **Deploy de ambas:**
```bash
npx supabase functions deploy
```

## 🔑 **Configuração de Credenciais**

### **API V1:**
- Configurar `SYNCPAY_API_KEY` nos secrets do Supabase
- Usa autenticação Basic Auth

### **API V2:**
- Credenciais hardcoded na edge function
- Client ID: `7a7ef813-bf52-4b40-b452-b57a2f89e766`
- Client Secret: `406397e0-07e3-46dc-b0ce-2cb658fb6dac`
- Usa autenticação Bearer Token

## 📊 **Diferenças Principais**

| Aspecto | API V1 | API V2 |
|---------|--------|--------|
| **Autenticação** | Basic Auth | Bearer Token |
| **Credenciais** | API Key | Client ID + Secret |
| **Status** | `pending` | `WAITING_FOR_APPROVAL` |
| **Metadata** | String | Objeto estruturado |
| **Checkout** | Presente | Removido |
| **IP** | No final | No início |

## 🎯 **Casos de Uso**

### **Usar V1 quando:**
- Projeto existente funcionando
- Precisa manter compatibilidade
- API Key antiga ainda válida

### **Usar V2 quando:**
- Novo projeto
- Quer usar as novas funcionalidades
- Credenciais V2 disponíveis

### **Usar ambas quando:**
- Migração gradual
- Testes A/B
- Backup em caso de problemas

## ⚠️ **Importante**

- Ambas as APIs podem coexistir no mesmo projeto
- Cada uma tem suas próprias credenciais
- Os logs são separados para facilitar debug
- Pode fazer testes comparativos entre as versões
