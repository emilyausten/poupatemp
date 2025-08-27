
import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { usePushNotifications, setToastHandler } from "@/hooks/usePushNotifications";
import { ToastNotification, useToastNotification } from "@/components/ToastNotification";
import { CustomerDataCapture } from "@/components/CustomerDataCapture";
import { useSmartAutomation } from "@/hooks/useSmartAutomation";
import { useNativeNotifications } from "@/components/NativeNotification";
import Servicos from "./pages/Servicos";
import DadosPessoais from "./pages/DadosPessoais";
import Index from "./pages/Index";
import DadosAdicionais from "./pages/DadosAdicionais";
import Agendamento from "./pages/Agendamento";
import Pagamento from "./pages/Pagamento";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import Admin from "./pages/Admin";
import AdminProtectedRoute from "./components/AdminProtectedRoute";

const queryClient = new QueryClient();

const App = () => {
  // Hook para notificações toast in-app
  const { notification, showToast, hideToast } = useToastNotification();
  
  // Hook para notificações customizadas nativas
  const { showNotification, NotificationContainer } = useNativeNotifications();
  
  // Configurar o handler global para notificações
  useEffect(() => {
    setToastHandler(showToast);
    
    // Expor função de notificação customizada globalmente
    (window as any).showNativeNotification = showNotification;
  }, [showToast, showNotification]);
  
  // Inicializar sistema de notificações push
  usePushNotifications({ debug: true });
  
  // Inicializar sistema de automação inteligente
  useSmartAutomation();
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        
        {/* Notificação Toast In-App */}
        <ToastNotification
          title={notification.title}
          message={notification.message}
          isVisible={notification.isVisible}
          onClose={hideToast}
        />
        
        {/* Container para notificações customizadas nativas */}
        <NotificationContainer />
        
        <CustomerDataCapture>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Servicos />} />
              <Route path="/dados-pessoais" element={<DadosPessoais />} />
              <Route path="/endereco" element={<Index />} />
              <Route path="/dados-adicionais" element={<DadosAdicionais />} />
              <Route path="/agendamento" element={<Agendamento />} />
              <Route path="/pagamento" element={<Pagamento />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/admin" element={
                <AdminProtectedRoute>
                  <Admin />
                </AdminProtectedRoute>
              } />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CustomerDataCapture>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
