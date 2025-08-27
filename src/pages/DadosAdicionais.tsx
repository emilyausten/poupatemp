import React, { useState } from 'react';
import { User, Home, Calendar, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const DadosAdicionais = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cnh, setCnh] = useState('');
  const [placaVeiculo, setPlacaVeiculo] = useState('');
  const [renavam, setRenavam] = useState('');

  const isFormValid = () => {
    return cnh.trim() !== '' && 
           placaVeiculo.trim() !== '' && 
           renavam.trim() !== '';
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

    // Salvar dados adicionais no localStorage
    const dadosAdicionais = { cnh, placaVeiculo, renavam };
    localStorage.setItem('dadosAdicionais', JSON.stringify(dadosAdicionais));
    console.log('Dados adicionais:', dadosAdicionais);
    navigate('/agendamento');
  };

  const handleVoltar = () => {
    navigate('/endereco');
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Form Header */}
          <div className="bg-blue-600 text-white px-4 py-3">
            <h1 className="text-lg font-medium">Dados Adicionais</h1>
          </div>

          {/* Form Content */}
          <div className="p-4 space-y-4">
            {/* CNH */}
            <div>
              <Label htmlFor="cnh" className="text-sm text-gray-600 mb-1 block">
                CNH
              </Label>
              <Input
                id="cnh"
                value={cnh}
                onChange={(e) => setCnh(e.target.value)}
                className="border-gray-300"
                placeholder=""
              />
            </div>

            {/* Placa do Veículo */}
            <div>
              <Label htmlFor="placaVeiculo" className="text-sm text-gray-600 mb-1 block">
                Placa do Veículo
              </Label>
              <Input
                id="placaVeiculo"
                value={placaVeiculo}
                onChange={(e) => setPlacaVeiculo(e.target.value)}
                className="border-gray-300"
                placeholder=""
              />
            </div>

            {/* Renavam */}
            <div>
              <Label htmlFor="renavam" className="text-sm text-gray-600 mb-1 block">
                Renavam
              </Label>
              <Input
                id="renavam"
                value={renavam}
                onChange={(e) => setRenavam(e.target.value)}
                className="border-gray-300"
                placeholder=""
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                className="flex-1 bg-gray-300 text-gray-700 border-gray-300 hover:bg-gray-400 h-10"
                onClick={handleVoltar}
              >
                Voltar
              </Button>
              <Button 
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-10"
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

export default DadosAdicionais;
