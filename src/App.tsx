import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CancelledProvider } from "@/contexts/CancelledContext";
import { DataProvider } from "@/contexts/DataContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import OverviewPage from "@/pages/OverviewPage";
import ProjectDetailPage from "@/pages/ProjectDetailPage";
import PackagesPage from "@/pages/PackagesPage";
import PartNumbersPage from "@/pages/PartNumbersPage";
import CancelledPage from "@/pages/CancelledPage";
import LoginPage from "@/pages/LoginPage";
import SignUpPage from "@/pages/SignUpPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CancelledProvider>
            <DataProvider>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/cadastro" element={<SignUpPage />} />
                <Route path="/esqueci-senha" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/" element={<OverviewPage />} />
                  <Route path="/projeto/:id" element={<ProjectDetailPage />} />
                  <Route path="/pacotes" element={<PackagesPage />} />
                  <Route path="/part-numbers" element={<PartNumbersPage />} />
                  <Route path="/cancelados" element={<CancelledPage />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </DataProvider>
          </CancelledProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
