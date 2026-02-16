import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Shield, FileText, QrCode } from "lucide-react";
import bktLogo from "@/assets/bkt-logo.png";

const AppHeader: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { to: "/", label: "Register", icon: FileText },
    { to: "/plans", label: "Plans", icon: LayoutDashboard },
    { to: "/dealer", label: "Dealer", icon: Users },
    { to: "/admin", label: "Admin", icon: Shield },
    { to: "/qr", label: "QR Code", icon: QrCode },
  ];

  return (
    <header className="bg-primary text-primary-foreground shadow-elevated sticky top-0 z-50">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src={bktLogo} alt="BKT Logo" className="h-10 w-auto" />
          <div>
            <div className="font-bold text-sm tracking-wide">Crossroads TAAS</div>
            <div className="text-xs opacity-70">Tyre Assistance & Service</div>
          </div>
        </Link>
        <nav className="flex items-center gap-1">
          {navItems.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
                }`}
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export default AppHeader;
