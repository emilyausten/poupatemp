

import React, { useState } from 'react';
import { User, Home, Calendar, MessageCircle, Copy, Check, Shield, Lock, CheckCircle, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import PaymentModal from '@/components/PaymentModal';
import { supabase } from '@/integrations/supabase/client';
import QRCode from 'react-qr-code';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useAutoPushNotifications } from '@/hooks/useAutoPushNotifications';
import { useSyncPayV2 } from '@/hooks/useSyncPayV2';
import { useRateLimit } from '@/hooks/useRateLimit';

interface PaymentResponse {
  status: number;
  message: string;
  data?: {
    id: string;
    status: string;
    amount: number;
    paymentMethod: string;
    pix?: {
      qrcode: string;
      expirationDate: string;
    };
    qrCode?: string;
    qrCodeBase64?: string;
  };
  error?: string;
}

const Pagamento = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [paymentData, setPaymentData] = useState<PaymentResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [pixGeneratedAt, setPixGeneratedAt] = useState<Date | null>(null);
  const [generatingPix, setGeneratingPix] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [pollingAttempts, setPollingAttempts] = useState(0);
  
  // Inicializar sistema de notificações
  const { triggers, sendNotification } = usePushNotifications({ debug: true });
  const { sendPaymentGeneratedMessage, sendPaymentConfirmedMessage } = useAutoPushNotifications();
  
  // Inicializar SyncPay V2 e rate limiting
  const { createTransaction, loading: syncPayLoading, error: syncPayError } = useSyncPayV2();
  const rateLimit = useRateLimit({
    maxAttempts: 10, // Aumentado de 3 para 10 tentativas
    windowMs: 5 * 60 * 1000, // Reduzido de 15 para 5 minutos
    storageKey: 'pix_generation'
  });

  const getServiceInfo = () => {
    const storedService = localStorage.getItem('servicoSelecionado');
    if (storedService) {
      return JSON.parse(storedService);
    }
    // Fallback caso não tenha serviço no localStorage
    return {
      nome: "RG - Primeira Via",
      valor: 74.00
    };
  };

  // Get user data from localStorage
  const getUserData = () => {
    const dadosPessoais = localStorage.getItem('dadosPessoais');
    if (dadosPessoais) {
      return JSON.parse(dadosPessoais);
    }
    // Fallback caso não tenha dados pessoais
    return {
      nomeCompleto: "Usuario Poupatempo",
      email: "usuario@email.com",
      cpf: "12345678901"
    };
  };

  // Get address data from localStorage
  const getAddressData = () => {
    const enderecoData = localStorage.getItem('enderecoData');
    if (enderecoData) {
      return JSON.parse(enderecoData);
    }
    return {
      cep: "01000000",
      rua: "Rua Exemplo",
      numero: "123",
      bairro: "Centro",
      cidade: "São Paulo",
      estado: "SP"
    };
  };

  const serviceInfo = getServiceInfo();
  const userData = getUserData();
  const addressData = getAddressData();

  // Função para validar CEP
  const validateCEP = (cep: string) => {
    const cleanCEP = cep.replace(/\D/g, '');
    if (cleanCEP.length !== 8) {
      throw new Error('CEP deve ter exatamente 8 dígitos');
    }
    return cleanCEP;
  };

  // Função para validar CPF
  const validateCPF = (cpf: string) => {
    const cleanCPF = cpf.replace(/\D/g, '');
    if (cleanCPF.length !== 11) {
      throw new Error('CPF deve ter exatamente 11 dígitos');
    }
    return cleanCPF;
  };

  // Função para validar telefone
  const validatePhone = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      throw new Error('Telefone deve ter 10 ou 11 dígitos');
    }
    return cleanPhone;
  };



  // Função para fazer polling do status da transação
  const pollTransactionStatus = async (txId: string, attempts = 0) => {
    if (attempts > 24) {
      console.log('❌ Timeout: PIX não foi gerado em 2 minutos');
      setGeneratingPix(false);
      toast({
        title: "Timeout",
        description: "PIX não foi gerado em tempo hábil. Tente novamente.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log(`🔍 Polling tentativa ${attempts + 1}/24 para transação:`, txId);
      
      const response = await fetch('https://werfsbezbsprestfpsxd.supabase.co/functions/v1/check-transaction-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactionId: txId })
      });

      const data = await response.json();
      console.log('📥 Resposta do polling:', data);

      if (data.success && data.pix_code && data.qr_code_base64) {
        // PIX gerado com sucesso!
        console.log('✅ PIX gerado com sucesso!');
        setGeneratingPix(false);
        
        const formattedResult = {
          status: 200,
          message: "PIX gerado com sucesso",
          data: {
            id: data.transaction_id,
            qrCode: data.pix_code,
            qrCodeBase64: data.qr_code_base64,
            status: "completed",
            amount: serviceInfo.valor,
            paymentMethod: "PIX"
          }
        };
        
        setPaymentData(formattedResult);
        setPixGeneratedAt(new Date());
        
        toast({
          title: "Sucesso!",
          description: `PIX de R$ ${serviceInfo.valor.toFixed(2).replace('.', ',')} gerado com sucesso!`,
        });
        
        return;
      }

      // Se ainda não está pronto, tenta novamente em 5 segundos
      setPollingAttempts(attempts + 1);
      setTimeout(() => pollTransactionStatus(txId, attempts + 1), 5000);
      
    } catch (error) {
      console.error('❌ Erro no polling:', error);
      setGeneratingPix(false);
      toast({
        title: "Erro",
        description: "Erro ao verificar status do PIX",
        variant: "destructive",
      });
    }
  };

  const handleEmitirPagamento = async () => {
    // Validar valor mínimo antes de processar
    if (serviceInfo.valor < 1.49) {
      toast({
        title: "Valor Inválido",
        description: "O valor mínimo para pagamento via PIX é de R$ 1,49",
        variant: "destructive",
      });
      setShowModal(false);
      return;
    }
    
    setLoading(true);
    setGeneratingPix(true);
    setPollingAttempts(0);

    try {
      // Validar dados antes de prosseguir
      let validatedCEP, validatedCPF, validatedPhone;
      try {
        validatedCEP = validateCEP(addressData.cep || "01000000");
        validatedCPF = validateCPF(userData.cpf || "11144477735");
        validatedPhone = validatePhone(userData.telefone || "11999999999");
      } catch (validationError) {
        toast({
          title: "Dados Inválidos",
          description: validationError instanceof Error ? validationError.message : "Verifique os dados informados",
          variant: "destructive",
        });
        setShowModal(false);
        return;
      }

      // Rate limiting temporariamente desabilitado
      // if (!rateLimit.checkRateLimit()) {
      //   toast({
      //     title: "Muitas tentativas",
      //     description: `Aguarde ${rateLimit.remainingTime} minutos antes de tentar novamente. Ou limpe o cache do navegador para resetar.`,
      //     variant: "destructive",
      //   });
      //   setShowModal(false);
      //   return;
      // }

      // Criar payload para SyncPay V2
      const syncPayPayload = {
        ip: "127.0.0.1",
        amount: serviceInfo.valor,
        customer: {
          name: userData.nomeCompleto || "Cliente",
          email: userData.email || "cliente@email.com",
          cpf: validatedCPF,
          phone: validatedPhone,
          externaRef: `ORDER_${Date.now()}`,
          address: {
            street: addressData.rua || "Rua Exemplo",
            streetNumber: addressData.numero || "123",
            complement: addressData.complemento || "",
            zipCode: validatedCEP,
            neighborhood: addressData.bairro || "Centro",
            city: addressData.cidade || "São Paulo",
            state: addressData.estado || "SP",
            country: "BR"
          }
        },
        items: [{
          title: serviceInfo.nome || "Serviço Poupatempo",
          quantity: 1,
          unitPrice: serviceInfo.valor,
          tangible: true
        }],
        postbackUrl: "https://poupatempo.app/payment-webhook",
        pix: {
          expiresInDays: "2024-12-31" // Data de expiração como string
        },
        metadata: {
          provider: "PoupatempoApp",
          sell_url: "https://poupatempo.app",
          order_url: "https://poupatempo.app/order",
          user_email: userData.email || "cliente@email.com",
          user_identitication_number: validatedCPF
        },
        traceable: true
      };

      // Chamar API SyncPay V2
      const result = await createTransaction(syncPayPayload);
      console.log('🚀 Transação criada:', result);

      // Verificar se a transação foi criada com sucesso
      if (result && result.pix_code && result.qr_code_base64) {
        // PIX gerado imediatamente - não precisa de polling
        console.log('✅ PIX gerado com sucesso!');
        setGeneratingPix(false);
        
        const formattedResult = {
          status: 200,
          message: "PIX gerado com sucesso",
          data: {
            id: result.id,
            qrCode: result.pix_code,
            qrCodeBase64: result.qr_code_base64,
            status: result.status || "completed",
            amount: serviceInfo.valor,
            paymentMethod: "PIX"
          }
        };
        
        console.log('📋 Resultado formatado:', formattedResult);
        setPaymentData(formattedResult);
        setPixGeneratedAt(new Date());
        
        toast({
          title: "Sucesso!",
          description: `PIX de R$ ${serviceInfo.valor.toFixed(2).replace('.', ',')} gerado com sucesso!`,
        });
      } else {
        // Se não tem PIX imediatamente, usar polling
        const txId = result?.id;
        setTransactionId(txId);
        
        // Fechar modal e mostrar loader
        setShowModal(false);
        
        // Iniciar polling para verificar quando o PIX estiver pronto
        if (txId) {
          pollTransactionStatus(txId);
        } else {
          console.error('❌ ID da transação não encontrado:', result);
          toast({
            title: "Erro",
            description: "Não foi possível obter o ID da transação",
            variant: "destructive",
          });
        }
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao gerar PIX';
      
      setShowModal(false);
      setGeneratingPix(false);
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para simular pagamento confirmado (apenas para demo)
  const handleSimularPagamentoConfirmado = () => {
    // 🔔 5. Notificação automática de pagamento confirmado
    sendPaymentConfirmedMessage();
    
    // Notificação local também
    sendNotification(
      '🔔 Pagamento confirmado',
      '🎉 Pagamento confirmado com sucesso! Seu agendamento está garantido. Em instantes, você receberá todos os detalhes.',
      'payment-confirmed'
    );
    
    toast({
      title: "🎉 Pagamento Confirmado!",
      description: "Seu agendamento está garantido! Você receberá todas as informações no seu email.",
    });
  };

  // Função para extrair o código PIX corretamente
  const getPixCode = () => {
    console.log('🔍 getPixCode - paymentData:', paymentData);
    if (!paymentData?.data) {
      console.log('❌ Sem dados de pagamento');
      return null;
    }
    
    // Acessar os campos corretos dentro de data
    const pixCode = paymentData.data.qrCode || paymentData.data.pix?.qrcode;
    console.log('🔍 PIX Code extraído:', pixCode);
    return pixCode || null;
  };

  // Função para extrair o QR Code Base64
  const getQrCodeBase64 = () => {
    if (!paymentData?.data) {
      console.log('❌ Sem dados de pagamento para QR Code');
      return null;
    }
    
    // Acessar o QR Code Base64 dentro de data
    const qrCodeBase64 = paymentData.data.qrCodeBase64;
    console.log('🔍 QR Code Base64 extraído:', qrCodeBase64 ? 'Encontrado' : 'Não encontrado');
    return qrCodeBase64 || null;
  };

  const handleCopyPixCode = async () => {
    const pixCode = getPixCode();
    if (pixCode) {
      try {
        await navigator.clipboard.writeText(pixCode);
        setCopied(true);
        toast({
          title: "Copiado!",
          description: "Código PIX copiado para a área de transferência",
        });
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao copiar código PIX",
          variant: "destructive",
        });
      }
    }
  };

  const handleVoltar = () => {
    // Verificar se é o serviço de licenciamento para voltar para dados adicionais
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

  const pixCode = getPixCode();

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
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Form Header */}
          <div className="bg-blue-600 text-white px-4 py-3">
            <h1 className="text-lg font-medium">Pagamento</h1>
          </div>

          {/* Form Content */}
          <div className="p-4 space-y-6">

            {!paymentData ? (
              <>
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-800 text-center">Gerar Guia de Pagamento</h2>
                  
                  {/* Loading state para geração do PIX */}
                  {generatingPix ? (
                    <div className="text-center space-y-4">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium text-gray-800">Gerando PIX...</h3>
                        <p className="text-sm text-gray-600">
                          Aguarde enquanto processamos seu pagamento
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Service Info */}
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium text-blue-900">{serviceInfo.nome}</h3>
                            <p className="text-sm text-blue-700">Serviço selecionado</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-blue-900">
                              R$ {serviceInfo.valor.toFixed(2).replace('.', ',')}
                            </p>
                            <p className="text-xs text-blue-700">Valor total</p>
                          </div>
                        </div>
                      </div>


                    </>
                  )}
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="space-y-2 text-sm text-gray-700">
                    <p><span className="font-medium text-gray-800">Atenção:</span> Emitir a guia e não realizar o pagamento impedirá a solicitação de novos agendamentos até que a pendência seja regularizada.</p>
                  </div>
                </div>

                {/* Atenção Section */}
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h3 className="font-semibold text-yellow-800 mb-3">Atenção:</h3>
                  <ul className="space-y-2 text-sm text-yellow-700">
                    <li>• Efetue o pagamento em até 30 minutos</li>
                    <li>• Após a confirmação, você receberá um email de confirmação</li>
                    <li>• Um aviso breve para lembrete será enviado no WhatsApp</li>
                    <li>• Compareça no local na data agendada</li>
                  </ul>
                </div>m

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    className="flex-1 bg-gray-300 text-gray-700 border-gray-300 hover:bg-gray-400 h-10"
                    onClick={handleVoltar}
                  >
                    Voltar
                  </Button>
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white h-10"
                    onClick={() => setShowModal(true)}
                  >
                    Emitir Guia de Pagamento
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Warning message for generated PIX */}
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-4">
                  <p className="text-sm text-yellow-800">
                    <span className="font-medium">Atenção:</span> Após a geração do PIX, você terá 30 minutos para efetuar o pagamento.
                  </p>
                </div>

                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-800 text-center">PIX Gerado com Sucesso!</h2>
                  
                  {/* QR Code display */}
                  {pixCode ? (
                    <div className="flex justify-center">
                      <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                        <QRCode
                          value={pixCode}
                          size={192}
                          style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                          viewBox={`0 0 192 192`}
                        />
                      </div>
                    </div>
                  ) : getQrCodeBase64() ? (
                    <div className="flex justify-center">
                      <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                        <img 
                          src={getQrCodeBase64()} 
                          alt="QR Code PIX"
                          className="w-48 h-48 object-contain"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <p className="text-sm text-red-700">
                        <span className="font-medium">Erro:</span> Código PIX não foi gerado corretamente. Tente gerar novamente.
                      </p>
                    </div>
                  )}

                  {/* PIX Code */}
                  {pixCode && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Código PIX (Copia e Cola)
                      </label>
                      <div className="relative">
                        <textarea
                          value={pixCode.replace(/Q3PAY_PAGAMENTOS_LTDA/g, 'Poupatempo_pagamentos')}
                          readOnly
                          className="w-full p-3 border border-gray-300 rounded-lg text-xs font-mono bg-gray-50 resize-none"
                          rows={4}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="absolute top-2 right-2"
                          onClick={handleCopyPixCode}
                        >
                          {copied ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Payment Info */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Valor:</span>
                        <span className="font-medium">R$ {serviceInfo.valor.toFixed(2).replace('.', ',')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">ID da Transação:</span>
                        <span className="font-mono text-xs">{paymentData.data?.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className="text-orange-600 font-medium">Aguardando Pagamento</span>
                      </div>
                      {pixGeneratedAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Expira em:</span>
                          <span className="text-gray-800">
                            {(() => {
                              const expirationTime = new Date(pixGeneratedAt.getTime() + 30 * 60 * 1000); // 30 minutos após a geração
                              return expirationTime.toLocaleString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit'
                              });
                            })()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Selos de Segurança PIX */}
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-center gap-4 text-xs">
                      <div className="flex items-center gap-1 text-blue-700">
                        <Shield className="w-3 h-3" />
                        <span>PIX Seguro</span>
                      </div>
                      <div className="flex items-center gap-1 text-blue-700">
                        <Lock className="w-3 h-3" />
                        <span>Criptografado</span>
                      </div>
                      <div className="flex items-center gap-1 text-blue-700">
                        <CheckCircle className="w-3 h-3" />
                        <span>Banco Central</span>
                      </div>
                    </div>
                  </div>

                  {pixCode ? (
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <p className="text-sm text-green-700">
                        <span className="font-medium">Como pagar:</span> Abra o aplicativo do seu banco, escaneie o QR Code ou copie e cole o código PIX acima para efetuar o pagamento.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <p className="text-sm text-red-700">
                        <span className="font-medium">Erro:</span> Não foi possível gerar o código PIX. Tente novamente.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3 pt-4">
                  
                  <Button 
                    variant="outline" 
                    className="bg-gray-300 text-gray-700 border-gray-300 hover:bg-gray-400 h-10"
                    onClick={() => {
                      setPaymentData(null);
                      setPixGeneratedAt(null);
                    }}
                  >
                    Gerar Novo PIX
                  </Button>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 text-white h-10"
                    onClick={() => navigate('/')}
                  >
                    Finalizar
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <PaymentModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleEmitirPagamento}
        loading={loading}
      />

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

export default Pagamento;