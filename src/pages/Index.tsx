import React, { useState, useEffect } from 'react';
import { User, Home, Calendar, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAutoPushNotifications } from '@/hooks/useAutoPushNotifications';
import { useMobileNotifications } from '@/hooks/useMobileNotifications';
import axios from 'axios';

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { sendWelcomeMessage } = useAutoPushNotifications();
  
  // Inicializar notificações móveis
  useMobileNotifications();
  const [cep, setCep] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [loading, setLoading] = useState(false);

  // Notificação automática de boas-vindas
  useEffect(() => {
    console.log('🔔 CHAMANDO sendWelcomeMessage na página Index');
    sendWelcomeMessage();
  }, [sendWelcomeMessage]);

  const estados = [
    { value: 'AC', label: 'Acre' },
    { value: 'AL', label: 'Alagoas' },
    { value: 'AP', label: 'Amapá' },
    { value: 'AM', label: 'Amazonas' },
    { value: 'BA', label: 'Bahia' },
    { value: 'CE', label: 'Ceará' },
    { value: 'DF', label: 'Distrito Federal' },
    { value: 'ES', label: 'Espírito Santo' },
    { value: 'GO', label: 'Goiás' },
    { value: 'MA', label: 'Maranhão' },
    { value: 'MT', label: 'Mato Grosso' },
    { value: 'MS', label: 'Mato Grosso do Sul' },
    { value: 'MG', label: 'Minas Gerais' },
    { value: 'PA', label: 'Pará' },
    { value: 'PB', label: 'Paraíba' },
    { value: 'PR', label: 'Paraná' },
    { value: 'PE', label: 'Pernambuco' },
    { value: 'PI', label: 'Piauí' },
    { value: 'RJ', label: 'Rio de Janeiro' },
    { value: 'RN', label: 'Rio Grande do Norte' },
    { value: 'RS', label: 'Rio Grande do Sul' },
    { value: 'RO', label: 'Rondônia' },
    { value: 'RR', label: 'Roraima' },
    { value: 'SC', label: 'Santa Catarina' },
    { value: 'SP', label: 'São Paulo' },
    { value: 'SE', label: 'Sergipe' },
    { value: 'TO', label: 'Tocantins' }
  ];

  const isFormValid = () => {
    return cep.trim() !== '' && 
           rua.trim() !== '' && 
           numero.trim() !== '' && 
           bairro.trim() !== '' && 
           cidade.trim() !== '' && 
           estado.trim() !== '';
  };

  const buscarCep = async (cepValue: string) => {
    if (cepValue.length === 8) {
      setLoading(true);
      try {
        const response = await axios.get(`https://viacep.com.br/ws/${cepValue}/json/`);
        if (response.data && !response.data.erro) {
          setRua(response.data.logradouro || '');
          setBairro(response.data.bairro || '');
          setCidade(response.data.localidade || '');
          setEstado(response.data.uf || '');
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCepChange = (value: string) => {
    const cleanCep = value.replace(/\D/g, '');
    setCep(cleanCep);
    if (cleanCep.length === 8) {
      buscarCep(cleanCep);
    }
  };

  const handleVoltar = () => {
    navigate('/dados-pessoais');
  };

  const handleProximo = () => {
    if (!isFormValid()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos antes de continuar.",
        variant: "destructive",
      });
      return;
    }

    console.log('Dados do endereço:', { cep, rua, numero, bairro, cidade, estado });
    
    // Salvar dados do endereço no localStorage para usar na próxima página
    localStorage.setItem('enderecoData', JSON.stringify({
      cep,
      rua,
      numero,
      bairro,
      cidade,
      estado
    }));
    
    // Verificar se é serviço de licenciamento para ir para dados adicionais
    const servico = localStorage.getItem('servicoSelecionado');
    if (servico) {
      const servicoData = JSON.parse(servico);
      if (servicoData.nome === 'Licenciamento (CRLV-e)') {
        navigate('/dados-adicionais');
        return;
      }
    }
    
    navigate('/agendamento');
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <img 
            src="/lovable-uploads/77c50366-3c6d-4d7b-b8a7-4fa2fc4e1fa3.png" 
            alt="Poupatempo" 
            className="h-8 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleLogoClick}
          />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <Home className="w-4 h-4 text-white" />
            </div>
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <Calendar className="w-4 h-4 text-gray-600" />
            </div>
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto p-4">
        {/* Notificações agora são solicitadas automaticamente na seleção de serviços */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Form Header */}
          <div className="bg-blue-600 text-white px-4 py-3">
            <h1 className="text-lg font-medium">Endereço</h1>
          </div>

          {/* Form Content */}
          <div className="p-4 space-y-4">
            {/* CEP */}
            <div>
              <Label htmlFor="cep" className="text-sm text-gray-600 mb-1 block">
                CEP
              </Label>
              <Input
                id="cep"
                value={cep}
                onChange={(e) => handleCepChange(e.target.value)}
                className="border-gray-300"
                placeholder="00000000"
                maxLength={8}
                disabled={loading}
              />
              {loading && <p className="text-xs text-blue-600 mt-1">Buscando CEP...</p>}
            </div>

            {/* Rua */}
            <div>
              <Label htmlFor="rua" className="text-sm text-gray-600 mb-1 block">
                Rua
              </Label>
              <Input
                id="rua"
                value={rua}
                onChange={(e) => setRua(e.target.value)}
                className="border-gray-300"
                placeholder=""
              />
            </div>

            {/* Número */}
            <div>
              <Label htmlFor="numero" className="text-sm text-gray-600 mb-1 block">
                Número
              </Label>
              <Input
                id="numero"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                className="border-gray-300"
                placeholder=""
              />
            </div>

            {/* Bairro */}
            <div>
              <Label htmlFor="bairro" className="text-sm text-gray-600 mb-1 block">
                Bairro
              </Label>
              <Input
                id="bairro"
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                className="border-gray-300"
                placeholder=""
              />
            </div>

            {/* Cidade */}
            <div>
              <Label htmlFor="cidade" className="text-sm text-gray-600 mb-1 block">
                Cidade
              </Label>
              <Input
                id="cidade"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                className="border-gray-300"
                placeholder=""
              />
            </div>

            {/* Estado */}
            <div>
              <Label htmlFor="estado" className="text-sm text-gray-600 mb-1 block">
                Estado
              </Label>
              <Select value={estado} onValueChange={setEstado}>
                <SelectTrigger className="w-full border-gray-300 bg-white h-10">
                  <SelectValue placeholder="Selecione o estado" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-300 shadow-lg z-50">
                  {estados.map((est) => (
                    <SelectItem key={est.value} value={est.value}>
                      {est.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                className="flex-1 bg-gray-300 text-gray-700 border-gray-300 hover:bg-gray-400"
                onClick={handleVoltar}
              >
                Voltar
              </Button>
              <Button 
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleProximo}
              >
                Próximo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-800 text-white mt-auto">
        <div className="max-w-md mx-auto px-4 py-8 text-center">
          <img 
            src="/lovable-uploads/a01f8b20-e4c2-4d31-bfe8-4c0e6d88ddd4.png" 
            alt="Gov.br" 
            className="h-12 mx-auto mb-4"
          />
          <h2 className="text-lg font-medium mb-2">Portal OficiaI</h2>
          <p className="text-sm text-gray-300 mb-6">
            Ministério da Gestão e da Inovação em Serviços Públicos
          </p>
          <div className="border-t border-gray-600 pt-4">
            <p className="text-xs text-gray-400">
              Todos os direitos reservados
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
