import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ServicesValuesList = () => {
  const servicos = [
    {
      nome: 'RG - Primeira Via',
      descricao: 'Solicite sua primeira via do RG',
      valor: 74.00
    },
    {
      nome: 'RG - Segunda Via',
      descricao: 'Solicite a segunda via do seu RG',
      valor: 63.00
    },
    {
      nome: 'CNH - Primeira Via',
      descricao: 'Solicite sua primeira habilitação',
      valor: 52.00
    },
    {
      nome: 'CNH - Renovação',
      descricao: 'Renove sua Carteira Nacional de Habilitação',
      valor: 74.00
    },
    {
      nome: 'Licenciamento (CRLV-e)',
      descricao: 'Importante: Preencha os dados para pagamento do Licenciamento.',
      valor: 63.00
    },
    {
      nome: 'Carteira Profissional - Segunda Via',
      descricao: 'Reemissão da Carteira de Profissional por motivo de perda, roubo, alteração do nome do profissional ou dados no documento.',
      valor: 52.00
    },
    {
      nome: 'CIN - Primeira Via',
      descricao: 'Obter Carteira de Identidade Nacional - CIN',
      valor: 74.00
    },
    {
      nome: 'CIN - Segunda Via',
      descricao: 'Obter segunda via da Carteira de Identidade Nacional - CIN',
      valor: 63.00
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Valores dos Serviços Disponíveis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {servicos.map((servico, index) => (
            <div 
              key={index}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-medium text-blue-600 text-sm mb-1">
                    {servico.nome}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {servico.descricao}
                  </p>
                </div>
                <div className="text-right ml-4">
                  <span className="text-lg font-bold text-green-600">
                    R$ {servico.valor.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-2">Integração Simpay</h4>
          <p className="text-sm text-blue-700">
            Os valores acima são automaticamente utilizados na geração de PIX via API Simpay. 
            O sistema detecta qual serviço foi selecionado e utiliza o valor correspondente.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServicesValuesList;