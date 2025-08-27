import React, { useEffect } from 'react';
import { useCustomerData } from '@/hooks/useCustomerData';

interface CustomerDataCaptureProps {
  onDataChange?: (data: any) => void;
  children?: React.ReactNode;
}

export const CustomerDataCapture: React.FC<CustomerDataCaptureProps> = ({ 
  onDataChange, 
  children 
}) => {
  const { saveCustomerData, getStoredCustomerData } = useCustomerData();

  useEffect(() => {
    // Monitorar mudanças nos campos de formulário da página
    const handleFormChange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (!target.name) return;

      // Mapear nomes dos campos para nossa estrutura de dados
      const fieldMapping: Record<string, string> = {
        'nome': 'customer_name',
        'name': 'customer_name',
        'customer_name': 'customer_name',
        'telefone': 'customer_phone',
        'phone': 'customer_phone',
        'customer_phone': 'customer_phone',
        'cpf': 'customer_cpf',
        'customer_cpf': 'customer_cpf',
        'endereco': 'customer_address_street',
        'address': 'customer_address_street',
        'customer_address_street': 'customer_address_street',
        'numero': 'customer_address_number',
        'number': 'customer_address_number',
        'customer_address_number': 'customer_address_number',
        'complemento': 'customer_address_complement',
        'complement': 'customer_address_complement',
        'customer_address_complement': 'customer_address_complement',
        'bairro': 'customer_address_neighborhood',
        'neighborhood': 'customer_address_neighborhood',
        'customer_address_neighborhood': 'customer_address_neighborhood',
        'cidade': 'customer_address_city',
        'city': 'customer_address_city',
        'customer_address_city': 'customer_address_city',
        'estado': 'customer_address_state',
        'state': 'customer_address_state',
        'customer_address_state': 'customer_address_state',
        'cep': 'customer_address_zip_code',
        'zip': 'customer_address_zip_code',
        'customer_address_zip_code': 'customer_address_zip_code',
        'produto': 'interested_product',
        'product': 'interested_product',
        'interested_product': 'interested_product'
      };

      const mappedField = fieldMapping[target.name.toLowerCase()];
      if (mappedField && target.value.trim()) {
        // Debounce para evitar muitas atualizações
        clearTimeout((window as any).customerDataTimeout);
        (window as any).customerDataTimeout = setTimeout(async () => {
          try {
            const currentData = getStoredCustomerData();
            const newData = {
              ...currentData,
              [mappedField]: target.value.trim()
            };
            
            await saveCustomerData(newData);
            
            console.log(`📝 Campo ${mappedField} capturado:`, target.value.trim());
            
            if (onDataChange) {
              onDataChange(newData);
            }
          } catch (error) {
            console.error('❌ Erro ao capturar dados do cliente:', error);
          }
        }, 1000); // 1 segundo de debounce
      }
    };

    // Adicionar listeners para diferentes tipos de input
    const inputTypes = ['input', 'change', 'blur'];
    
    inputTypes.forEach(eventType => {
      document.addEventListener(eventType, handleFormChange, true);
    });

    // Cleanup
    return () => {
      clearTimeout((window as any).customerDataTimeout);
      inputTypes.forEach(eventType => {
        document.removeEventListener(eventType, handleFormChange, true);
      });
    };
  }, [saveCustomerData, getStoredCustomerData, onDataChange]);

  // Monitorar submissões de formulário para capturar dados completos
  useEffect(() => {
    const handleFormSubmit = async (event: Event) => {
      const form = event.target as HTMLFormElement;
      if (!form.tagName || form.tagName.toLowerCase() !== 'form') return;

      try {
        const formData = new FormData(form);
        const customerData: any = {};

        // Capturar todos os dados do formulário
        formData.forEach((value, key) => {
          const fieldMapping: Record<string, string> = {
            'nome': 'customer_name',
            'name': 'customer_name',
            'telefone': 'customer_phone',
            'phone': 'customer_phone',
            'cpf': 'customer_cpf',
            'endereco': 'customer_address_street',
            'address': 'customer_address_street',
            'numero': 'customer_address_number',
            'number': 'customer_address_number',
            'complemento': 'customer_address_complement',
            'complement': 'customer_address_complement',
            'bairro': 'customer_address_neighborhood',
            'neighborhood': 'customer_address_neighborhood',
            'cidade': 'customer_address_city',
            'city': 'customer_address_city',
            'estado': 'customer_address_state',
            'state': 'customer_address_state',
            'cep': 'customer_address_zip_code',
            'zip': 'customer_address_zip_code',
            'produto': 'interested_product',
            'product': 'interested_product'
          };

          const mappedField = fieldMapping[key.toLowerCase()];
          if (mappedField && value.toString().trim()) {
            customerData[mappedField] = value.toString().trim();
          }
        });

        if (Object.keys(customerData).length > 0) {
          console.log('📋 Dados do formulário capturados:', customerData);
          await saveCustomerData(customerData);
          
          if (onDataChange) {
            onDataChange(customerData);
          }
        }
      } catch (error) {
        console.error('❌ Erro ao capturar dados do formulário:', error);
      }
    };

    document.addEventListener('submit', handleFormSubmit, true);

    return () => {
      document.removeEventListener('submit', handleFormSubmit, true);
    };
  }, [saveCustomerData, onDataChange]);

  return <>{children}</>;
};