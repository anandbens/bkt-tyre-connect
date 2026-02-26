import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { User, CreditCard, Share2, AlertTriangle, Receipt, LogOut, Menu, X } from "lucide-react";
import bktLogo from "@/assets/bkt-logo.png";

const menuItems = [
  { path: "/customer/dashboard", label: "Profile", icon: User },
  { path: "/customer/membership", label: "Membership Card", icon: CreditCard },
  { path: "/customer/referral", label: "My Referral", icon: Share2 },
  { path: "/customer/complaints", label: "My Complaints", icon: AlertTriangle },
  { path: "/customer/transactions", label: "My Transactions", icon: Receipt },
];

export interface CustomerSession {
  customer_code: string;
  customer_name: string;
  mobile_number: string;
  email: string | null;
  state: string | null;
  city: string;
  vehicle_number: string;
  vehicle_make_model: string | null;
  dealer_code: string;
}

const CustomerLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSession] = useState<CustomerSession | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("customer_session");
    if (!stored) {
      navigate("/customer-login");
      return;
    }
    setSession(JSON.parse(stored));
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("customer_session");
    navigate("/customer-login");
  };

  if (!session) return null;

  return (
    <div className="min-h-[calc(100vh-56px)] flex bg-background">
      {/* Sidebar - desktop */}
      <aside className="hidden md:flex flex-col w-56 bg-card border-r border-border shrink-0">
        <div className="p-4 border-b border-border">
          <p className="text-sm font-semibold text-foreground truncate">{session.customer_name}</p>
          <p className="text-xs text-muted-foreground">{session.mobile_number}</p>
        </div>
        <nav className="flex-1 py-2">
          {menuItems.map(({ path, label, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${
                  active ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            );
          })}
        </nav>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 border-t border-border"
        >
          <LogOut size={16} /> Logout
        </button>
      </aside>

      {/* Mobile header for sidebar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border flex items-center justify-around py-2">
        {menuItems.map(({ path, label, icon: Icon }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-0.5 text-[10px] px-2 py-1 ${
                active ? "text-primary font-semibold" : "text-muted-foreground"
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          );
        })}
        <button onClick={logout} className="flex flex-col items-center gap-0.5 text-[10px] px-2 py-1 text-destructive">
          <LogOut size={18} />
          Logout
        </button>
      </div>

      {/* Main content */}
      <main className="flex-1 p-4 sm:p-6 pb-20 md:pb-6 overflow-auto">
        <Outlet context={session} />
      </main>
    </div>
  );
};

export default CustomerLayout;
