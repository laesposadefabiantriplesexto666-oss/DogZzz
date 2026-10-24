import React from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingCart, ShieldCheck, UserCheck, ChevronDown, Sparkles, Heart } from 'lucide-react';

interface NavbarProps {
  currentViewTitle: string;
  onOpenPos: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentViewTitle, onOpenPos }) => {
  const { settings, currentUser, availableUsers, setCurrentUser, isAdmin } = useApp();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  return (
    <header className="h-16 px-6 bg-[#FFFDFB] border-b border-[#EADFD5] flex items-center justify-between gap-8 shrink-0 z-20">
      {/* Zone 1: Brand Wordmark with DogZzz Logo */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <img
            src={settings.logoUrl || '/src/assets/images/dogzzz_brand_logo_1792871852948.jpg'}
            alt="DogZzz"
            referrerPolicy="no-referrer"
            className="w-9 h-9 rounded-full object-cover border border-[#D9CABE] shadow-xs"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold tracking-tight text-[#382417] whitespace-nowrap shrink-0">
                {settings.businessName}
              </span>
              <span className="text-[10px] text-[#4A6B53] font-semibold hidden lg:inline">
                🐾 {settings.slogan}
              </span>
            </div>
          </div>
        </div>

        {settings.isDemoMode && (
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-[#EAF1EB] text-[#3B5742] border border-[#C5DAC8]">
            <Sparkles className="w-3 h-3 text-[#4A6B53]" />
            Modo Demo
          </span>
        )}
      </div>

      {/* Zone 2: Current Context & Breadcrumb */}
      <div className="hidden md:flex items-center gap-2 text-xs text-[#7A6150]">
        <span>Camas para Perros</span>
        <span aria-hidden="true">/</span>
        <span className="font-semibold text-[#382417]">{currentViewTitle}</span>
      </div>

      {/* Zone 3: User Role Switcher & Primary Action */}
      <div className="flex items-center gap-3 shrink-0">
        {/* User Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#EADFD5] bg-[#FAF7F2] hover:bg-[#F2ECE4] text-xs text-[#382417] transition-colors"
          >
            {isAdmin ? (
              <ShieldCheck className="w-4 h-4 text-[#4A6B53]" />
            ) : (
              <UserCheck className="w-4 h-4 text-[#7A6150]" />
            )}
            <div className="text-left hidden sm:block">
              <p className="font-semibold text-[#382417] leading-none">{currentUser.name}</p>
              <p className="text-[10px] text-[#7A6150] mt-0.5">
                {isAdmin ? 'Administrador DogZzz' : 'Asesor en Tienda'}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#A89689]" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-[#EADFD5] py-1.5 z-50">
              <div className="px-3 py-1.5 border-b border-[#F0EAE1] text-xs text-[#7A6150]">
                Cambiar operador / rol de prueba:
              </div>
              {availableUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    setCurrentUser(u);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#FAF7F2] transition-colors ${
                    currentUser.id === u.id ? 'bg-[#EAF1EB] text-[#3B5742] font-semibold' : 'text-[#382417]'
                  }`}
                >
                  <div>
                    <p>{u.name}</p>
                    <p className="text-[10px] text-[#7A6150]">{u.title}</p>
                  </div>
                  {u.role === 'ADMIN' && (
                    <span className="text-[9px] uppercase font-bold text-[#3B5742] bg-[#D8E5D8] px-1.5 py-0.5 rounded">
                      Admin
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Primary POS Action Button in Soft Terracotta */}
        <button
          onClick={onOpenPos}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#C25E42] hover:bg-[#B04D32] rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Registrar Venta</span>
        </button>
      </div>
    </header>
  );
};
