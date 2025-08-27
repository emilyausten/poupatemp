import React from 'react';
import { Star, Quote } from 'lucide-react';

interface Depoimento {
  id: string;
  nome: string;
  servico: string;
  comentario: string;
  estrelas: number;
  data: string;
}

const TestemunhosClientes = () => {
  const depoimentos: Depoimento[] = [
    {
      id: '1',
      nome: 'Maria Silva',
      servico: 'RG Segunda Via',
      comentario: 'Excelente serviço! Consegui agendar meu RG de forma muito rápida e fácil. O atendimento foi perfeito e não precisei enfrentar filas.',
      estrelas: 5,
      data: '14/05/2024'
    },
    {
      id: '2',
      nome: 'João Santos',
      servico: 'RG Primeira Via',
      comentario: 'Muito prático e eficiente. A plataforma é intuitiva e o processo todo foi muito simples. Recomendo para todos!',
      estrelas: 5,
      data: '09/05/2024'
    },
    {
      id: '3',
      nome: 'Ana Costa',
      servico: 'RG Segunda Via',
      comentario: 'Ótima experiência! Economizei muito tempo com o agendamento online. O único ponto é que gostaria de mais horários disponíveis.',
      estrelas: 4,
      data: '07/05/2024'
    },
    {
      id: '4',
      nome: 'Carlos Oliveira',
      servico: 'RG Primeira Via',
      comentario: 'Fantástico! Nunca pensei que seria tão fácil agendar serviços públicos. A tecnologia realmente facilitou muito minha vida.',
      estrelas: 5,
      data: '04/05/2024'
    },
    {
      id: '5',
      nome: 'Lucia Ferreira',
      servico: 'RG Segunda Via',
      comentario: 'Serviço impecável. Desde o agendamento até o atendimento, tudo funcionou perfeitamente. Muito obrigada pela praticidade!',
      estrelas: 5,
      data: '01/05/2024'
    },
    {
      id: '6',
      nome: 'Roberto Lima',
      servico: 'RG Primeira Via',
      comentario: 'Muito bom! O sistema é bem organizado e consegui resolver minha pendência rapidamente. Continuem assim!',
      estrelas: 4,
      data: '27/04/2024'
    }
  ];

  const renderEstrelas = (quantidade: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < quantidade ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const calcularMediaAvaliacoes = () => {
    const somaEstrelas = depoimentos.reduce((acc, dep) => acc + dep.estrelas, 0);
    return (somaEstrelas / depoimentos.length).toFixed(1);
  };

  return (
    <div className="bg-white py-16">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            O que nossos clientes dizem
          </h2>
          
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex items-center gap-1">
              {renderEstrelas(5)}
            </div>
            <span className="text-gray-600 font-medium">
              {calcularMediaAvaliacoes()} de 5 ({depoimentos.length} avaliações)
            </span>
          </div>
          
          <p className="text-gray-600 text-lg">
            Milhares de pessoas já utilizaram nossos serviços de agendamento
          </p>
        </div>

        {/* Grid de Depoimentos */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {depoimentos.map((depoimento) => (
            <div
              key={depoimento.id}
              className="bg-gray-50 rounded-lg p-6 relative hover:shadow-md transition-shadow duration-300"
            >
              {/* Ícone de aspas */}
              <div className="absolute top-4 right-4 text-blue-200">
                <Quote className="w-8 h-8" />
              </div>
              
              {/* Estrelas */}
              <div className="flex items-center gap-1 mb-4">
                {renderEstrelas(depoimento.estrelas)}
              </div>
              
              {/* Comentário */}
              <p className="text-gray-700 italic mb-6 text-sm leading-relaxed">
                "{depoimento.comentario}"
              </p>
              
              {/* Informações do cliente */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">
                      {depoimento.nome}
                    </h4>
                    <p className="text-blue-600 text-xs font-medium">
                      {depoimento.servico}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500 text-xs">
                      {depoimento.data}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestemunhosClientes;