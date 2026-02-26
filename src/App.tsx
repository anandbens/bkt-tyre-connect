import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import Register from "@/pages/Register";
import PlanSelection from "@/pages/PlanSelection";
import DealerDashboard from "@/pages/DealerDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import DealerQR from "@/pages/DealerQR";
import CustomerLogin from "@/pages/CustomerLogin";
import CustomerLayout from "@/pages/customer/CustomerLayout";
import ProfilePage from "@/pages/customer/ProfilePage";
import MembershipPage from "@/pages/customer/MembershipPage";
import ReferralPage from "@/pages/customer/ReferralPage";
import ComplaintsPage from "@/pages/customer/ComplaintsPage";
import TransactionsPage from "@/pages/customer/TransactionsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppHeader />
        <Routes>
          <Route path="/" element={<Register />} />
          <Route path="/plans" element={<PlanSelection />} />
          <Route path="/dealer" element={<DealerDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/qr" element={<DealerQR />} />
          <Route path="/customer-login" element={<CustomerLogin />} />
          <Route path="/customer" element={<CustomerLayout />}>
            <Route path="dashboard" element={<ProfilePage />} />
            <Route path="membership" element={<MembershipPage />} />
            <Route path="referral" element={<ReferralPage />} />
            <Route path="complaints" element={<ComplaintsPage />} />
            <Route path="transactions" element={<TransactionsPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
