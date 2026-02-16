import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Shield, FileText, QrCode, Menu, X } from "lucide-react";
import bktLogo from "@/assets/bkt-logo.png";

const AppHeader: React.FC = () => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { to: "/", label: "Register", icon: FileText },
    { to: "/plans", label: "Plans", icon: LayoutDashboard },
    { to: "/dealer", label: "Dealer", icon: Users },
    { to: "/admin", label: "Admin", icon: Shield },
    { to: "/qr", label: "QR Code", icon: QrCode },
  ];

  return (
    <header className="bg-white text-foreground shadow-md sticky top-0 z-50 border-b border-border">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src={bktLogo} alt="BKT Logo" className="h-10 w-auto" />
          <div>
            <div className="font-bold text-sm tracking-wide text-primary">Crossroads TAAS</div>
            <div className="text-xs text-muted-foreground">Tyre Assistance & Service</div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground/70 hover:text-primary hover:bg-secondary"
                }`}
              >
                <Icon size={16} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-md text-foreground hover:bg-secondary"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="md:hidden border-t border-border bg-white px-4 pb-3 pt-1">
          {navItems.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground/70 hover:text-primary hover:bg-secondary"
                }`}
              >
                <Icon size={16} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
};

export default AppHeader;
