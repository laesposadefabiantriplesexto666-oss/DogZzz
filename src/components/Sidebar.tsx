import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Dog,
  Users,
  Truck,
  ClipboardList,
  BarChart3,
  Settings,
  HeartHandshake
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export type NavView = 
  | 'dashboard'
  | 'pos'
  | 'inventory'
  | 'customers'
  | 'deliveries'
  | 'orders'
  | 'reports'
  | 'settings';

interface SidebarProps {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  mobileOpen,
  onCloseMobile
}) => {
  const { orders, products, settings } = useApp();

  const pendingDeliveriesCount = orders.filter(
    (o) => o.delivery.required && ['PROGRAMADA', 'EN_CAMINO', 'REPROGRAMADA'].includes(o.delivery.status)
  ).length;

  const lowStockCount = products.filter((p) => p.isActive && p.stock <= p.minStockAlert).length;

  const navItems: Array<{
    id: NavView;
    label: string;
    description: string;
    icon: React.ElementType;
    badge?: number;
    badgeColor?: string;
  }> = [
    {
      id: 'dashboard',
      label: 'Panel Principal',
      description: 'Resumen y camas destacadas',
      icon: LayoutDashboard
    },
    {
      id: 'pos',
      label: 'Registrar Venta',
      description: 'Punto de venta y variantes',
      icon: ShoppingCart
    },
    {
      id: 'inventory',
      label: 'Catálogo de Camas',
      description: 'Modelos, tallas y existencias',
      icon: Dog,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      badgeColor: 'bg-[#FBEBE7] text-[#B04D32]'
    },
    {
      id: 'customers',
      label: 'Clientes y Mascotas',
      description: 'Dueños, perritos y domicilios',
      icon: Users
    },
    {
      id: 'deliveries',
      label: 'Entregas a Domicilio',
      description: 'Rutas, horarios y fletes',
      icon: Truck,
      badge: pendingDeliveriesCount > 0 ? pendingDeliveriesCount : undefined,
      badgeColor: 'bg-[#EAF1EB] text-[#3B5742]'
    },
    {
      id: 'orders',
      label: 'Historial de Pedidos',
      description: 'Folios, abonos y seguimiento',
      icon: ClipboardList
    },
    {
      id: 'reports',
      label: 'Reportes Comerciales',
      description: 'Ventas, tallas top y finanzas',
      icon: BarChart3
    },
    {
      id: 'settings',
      label: 'Configuración DogZzz',
      description: 'Tienda, categorías y respaldos',
      icon: Settings
    }
  ];

  const handleNavClick = (viewId: NavView) => {
    onSelectView(viewId);
    if (mobileOpen) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 w-64 bg-[#2C1810] text-[#EADFD5] flex flex-col z-40 transition-transform duration-200 ease-in-out border-r border-[#3D251A] ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header with Sleeping Dog Mascot */}
        <div className="h-16 px-4 flex items-center gap-3 border-b border-[#3D251A] shrink-0">
          <img
            src={settings.logoUrl || '/src/assets/images/dogzzz_brand_logo_1792871852948.jpg'}
            alt="DogZzz"
            referrerPolicy="no-referrer"
            className="w-10 h-10 rounded-full object-cover border border-[#523624] shadow-sm shrink-0"
          />
          <div className="min-w-0">
            <h2 className="text-base font-bold text-white tracking-tight leading-none">
              {settings.businessName}
            </h2>
            <p className="text-[10px] text-[#A89689] truncate mt-1">Camas para Perros</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-semibold text-[#8C7565] uppercase tracking-wider">
            Operaciones de Tienda
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors group ${
                  isActive
                    ? 'bg-[#4A6B53] text-white font-medium shadow-xs'
                    : 'text-[#D9CABE] hover:bg-[#3D251A] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-5 h-5 shrink-0 transition-colors ${
                      isActive ? 'text-[#D8E5D8]' : 'text-[#A89689] group-hover:text-white'
                    }`}
                  />
                  <div className="truncate">
                    <p className="text-xs leading-none truncate font-medium">{item.label}</p>
                    <p className={`text-[10px] truncate mt-0.5 ${isActive ? 'text-[#D8E5D8]' : 'text-[#8C7565]'}`}>
                      {item.description}
                    </p>
                  </div>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-bold rounded tabular-nums shrink-0 ${
                      item.badgeColor || 'bg-[#3D251A] text-[#D9CABE]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom DogZzz Slogan Badge */}
        <div className="p-3 border-t border-[#3D251A] shrink-0 bg-[#24130B]">
          <div className="p-2.5 rounded-lg bg-[#351E14] border border-[#45291C]">
            <div className="flex items-center gap-1.5 text-[11px] text-[#EADFD5]">
              <HeartHandshake className="w-3.5 h-3.5 text-[#C25E42]" />
              <span className="font-semibold">{settings.businessName}</span>
            </div>
            <p className="text-[10px] text-[#A89689] mt-1 italic">
              "{settings.slogan}"
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
