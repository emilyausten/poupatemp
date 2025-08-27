import React from 'react';
import { Clock, Users, ThumbsUp } from 'lucide-react';

const MetricasDesempenho = () => {
  const metricas = [
    {
      numero: '98%',
      texto: 'Satisfação',
      icone: ThumbsUp,
      cor: 'text-blue-600'
    },
    {
      numero: '15min',
      texto: 'Tempo médio',
      icone: Clock,
      cor: 'text-blue-600'
    },
    {
      numero: '2M+',
      texto: 'Atendimentos',
      icone: Users,
      cor: 'text-blue-600'
    }
  ];

  return (
    <div className="bg-blue-50 py-16">
      <div className="max-w-4xl mx-auto px-6 text-center">
        {/* Título */}
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Junte-se a milhares de clientes satisfeitos
        </h2>
        
        {/* Descrição */}
        <p className="text-gray-600 text-lg mb-12 max-w-3xl mx-auto">
          Experimente nosso serviço de agendamento e veja por que somos a escolha preferida para serviços públicos digitais.
        </p>

        {/* Grid de Métricas */}
        <div className="grid md:grid-cols-3 gap-8">
          {metricas.map((metrica, index) => {
            const IconeComponente = metrica.icone;
            return (
              <div key={index} className="flex flex-col items-center">
                {/* Ícone */}
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                  <IconeComponente className={`w-8 h-8 ${metrica.cor}`} />
                </div>
                
                {/* Número */}
                <div className={`text-5xl font-bold ${metrica.cor} mb-2`}>
                  {metrica.numero}
                </div>
                
                {/* Texto */}
                <p className="text-gray-600 text-lg font-medium">
                  {metrica.texto}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MetricasDesempenho;