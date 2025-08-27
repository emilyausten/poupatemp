import React, { useState, useEffect } from 'react';
import { Clock, TrendingUp, Activity, MapPin, Check } from 'lucide-react';

interface Agendamento {
  id: string;
  nome: string;
  servico: string;
  cidade: string;
  estado: string;
  tempo: string;
  status: 'Confirmado';
  cor: string;
  tempoMinutos: number;
}

const UltimosAgendamentos = () => {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [agendamentosHoje, setAgendamentosHoje] = useState(121);
  const [agendamentosSemana, setAgendamentosSemana] = useState(1268);
  const [isUpdating, setIsUpdating] = useState(false);

  // Dados fictícios para gerar agendamentos
  const nomes = [
    'Ricardo Carvalho', 'Sérgio Souza', 'Juliana Duarte', 'Maria Santos', 
    'João Silva', 'Ana Costa', 'Pedro Oliveira', 'Carla Ferreira',
    'Roberto Lima', 'Fernanda Alves', 'Carlos Mendes', 'Patrícia Rocha',
    'Marcos Pereira', 'Luciana Barros', 'Rafael Gomes', 'Simone Araújo'
  ];

  const servicos = [
    { nome: 'RG - Primeira Via', cor: 'bg-blue-500' },
    { nome: 'CPF - Segunda Via', cor: 'bg-purple-500' },
    { nome: 'CNH - Renovação', cor: 'bg-green-500' },
    { nome: 'Auxílio Brasil - Cadastro', cor: 'bg-gray-500' },
    { nome: 'Licenciamento (CRLV-e)', cor: 'bg-orange-500' },
    { nome: 'Carteira Profissional', cor: 'bg-red-500' },
    { nome: 'CIN - Primeira Via', cor: 'bg-indigo-500' }
  ];

  const cidades = [
    { cidade: 'Santos', estado: 'SP' },
    { cidade: 'São Paulo', estado: 'SP' },
    { cidade: 'Rio de Janeiro', estado: 'RJ' },
    { cidade: 'Aparecida de Goiânia', estado: 'GO' },
    { cidade: 'Belo Horizonte', estado: 'MG' },
    { cidade: 'Curitiba', estado: 'PR' },
    { cidade: 'Salvador', estado: 'BA' },
    { cidade: 'Recife', estado: 'PE' },
    { cidade: 'Brasília', estado: 'DF' },
    { cidade: 'Fortaleza', estado: 'CE' }
  ];

  const gerarAgendamento = (): Agendamento => {
    const nome = nomes[Math.floor(Math.random() * nomes.length)];
    const servico = servicos[Math.floor(Math.random() * servicos.length)];
    const localizacao = cidades[Math.floor(Math.random() * cidades.length)];
    const tempoMinutos = Math.floor(Math.random() * 5) + 1; // 1-5 minutos
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      nome,
      servico: servico.nome,
      cidade: localizacao.cidade,
      estado: localizacao.estado,
      tempo: `há ${tempoMinutos} minuto${tempoMinutos > 1 ? 's' : ''}`,
      status: 'Confirmado',
      cor: servico.cor,
      tempoMinutos
    };
  };

  const atualizarAgendamentos = () => {
    setIsUpdating(true);
    
    // Gerar novos agendamentos
    const novosAgendamentos = Array.from({ length: 3 }, gerarAgendamento);
    
    // Atualizar contadores
    setAgendamentosHoje(prev => prev + Math.floor(Math.random() * 3) + 1);
    setAgendamentosSemana(prev => prev + Math.floor(Math.random() * 5) + 2);
    
    // Adicionar novos agendamentos ao topo da lista
    setAgendamentos(prev => [...novosAgendamentos, ...prev].slice(0, 10));
    
    setTimeout(() => setIsUpdating(false), 500);
  };

  useEffect(() => {
    // Gerar agendamentos iniciais
    const agendamentosIniciais = Array.from({ length: 3 }, gerarAgendamento);
    setAgendamentos(agendamentosIniciais);

    // Configurar atualização automática a cada 8 segundos
    const interval = setInterval(atualizarAgendamentos, 8000);
    
    return () => clearInterval(interval);
  }, []);

  const formatarTempo = (tempo: string) => {
    return tempo;
  };

  const obterInicialNome = (nome: string) => {
    return nome.split(' ').map(part => part[0]).join('').substring(0, 2);
  };

  const obterCorAvatar = (index: number) => {
    const cores = ['bg-blue-500', 'bg-purple-500', 'bg-gray-500', 'bg-green-500', 'bg-orange-500'];
    return cores[index % cores.length];
  };

  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <span className="bg-green-100 text-green-600 text-xs px-3 py-1 rounded-full flex items-center gap-1">
              <Activity className="w-3 h-3" />
              Em tempo real
            </span>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Últimos Agendamentos Realizados
          </h2>
          <p className="text-gray-600">
            Veja quem acabou de agendar seus serviços em todo o Brasil
          </p>
        </div>

        {/* Estatísticas */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Agendamentos Hoje</p>
                <p className="text-2xl font-bold text-green-600 flex items-center gap-1">
                  +{agendamentosHoje}
                  <TrendingUp className="w-4 h-4" />
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Esta Semana</p>
                <p className="text-2xl font-bold text-blue-600 flex items-center gap-1">
                  {agendamentosSemana.toLocaleString()}
                  <TrendingUp className="w-4 h-4" />
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Agendamentos */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="max-h-96 overflow-y-auto">
            {agendamentos.map((agendamento, index) => (
              <div
                key={agendamento.id}
                className={`p-4 border-b border-gray-100 last:border-b-0 transition-all duration-300 ${
                  index < 3 && isUpdating ? 'bg-green-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 ${obterCorAvatar(index)} rounded-full flex items-center justify-center text-white font-medium text-sm`}>
                    {obterInicialNome(agendamento.nome)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">{agendamento.nome}</span>
                      <span className={`text-xs px-2 py-1 rounded ${agendamento.cor} text-white`}>
                        {agendamento.servico}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {agendamento.cidade}, {agendamento.estado}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatarTempo(agendamento.tempo)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-green-600 text-sm">
                      <Check className="w-4 h-4" />
                      {agendamento.status}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Indicador de Atualização */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <span className="text-sm text-gray-600">Sistema atualizando em tempo real</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UltimosAgendamentos;