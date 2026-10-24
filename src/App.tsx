/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar, NavView } from './components/Sidebar';
import { ToastContainer } from './components/ToastContainer';
import { ReceiptModal } from './components/ReceiptModal';
import { NewProductModal } from './components/NewProductModal';
import { NewCustomerModal } from './components/NewCustomerModal';
import { DashboardView } from './views/DashboardView';
import { SalesPosView } from './views/SalesPosView';
import { InventoryView } from './views/InventoryView';
import { CustomersView } from './views/CustomersView';
import { DeliveriesView } from './views/DeliveriesView';
import { OrdersHistoryView } from './views/OrdersHistoryView';
import { ReportsView } from './views/ReportsView';
import { SettingsView } from './views/SettingsView';
import { Order, Customer } from './types';
import { Menu } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<NavView>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Global Modals State
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [selectedOrderForHistory, setSelectedOrderForHistory] = useState<Order | null>(null);

  const viewTitles: Record<NavView, string> = {
    dashboard: 'Panel Principal',
    pos: 'Punto de Venta (POS)',
    inventory: 'Inventario de Camas',
    customers: 'Directorio de Clientes',
    deliveries: 'Entregas a Domicilio',
    orders: 'Historial de Pedidos',
    reports: 'Reportes y Finanzas',
    settings: 'Configuración y Despliegue'
  };

  const handleSaleCompleted = (order: Order) => {
    setReceiptOrder(order);
  };

  const handleSelectOrderFromAnywhere = (order: Order) => {
    setSelectedOrderForHistory(order);
    setCurrentView('orders');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8F7F4] text-stone-900 select-none">
      {/* Toast Notifications */}
      <ToastContainer />

      {/* Global Modals */}
      <ReceiptModal order={receiptOrder} onClose={() => setReceiptOrder(null)} />
      <NewProductModal
        isOpen={isNewProductModalOpen}
        onClose={() => setIsNewProductModalOpen(false)}
      />
      <NewCustomerModal
        isOpen={isNewCustomerModalOpen}
        onClose={() => setIsNewCustomerModalOpen(false)}
      />

      {/* Responsive Sidebar */}
      <Sidebar
        currentView={currentView}
        onSelectView={(v) => {
          setCurrentView(v);
          setMobileMenuOpen(false);
        }}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header Navbar */}
        <div className="relative">
          {/* Mobile hamburger button */}
          <div className="md:hidden absolute left-4 top-4 z-30">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200"
              title="Menú"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          <Navbar
            currentViewTitle={viewTitles[currentView]}
            onOpenPos={() => setCurrentView('pos')}
          />
        </div>

        {/* View Content Scrollport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentView === 'dashboard' && (
            <DashboardView
              onNavigate={(view) => setCurrentView(view)}
              onOpenNewProductModal={() => setIsNewProductModalOpen(true)}
              onOpenNewCustomerModal={() => setIsNewCustomerModalOpen(true)}
            />
          )}

          {currentView === 'pos' && (
            <SalesPosView
              onOpenNewCustomerModal={() => setIsNewCustomerModalOpen(true)}
              onSaleCompleted={handleSaleCompleted}
            />
          )}

          {currentView === 'inventory' && (
            <InventoryView
              onOpenNewProductModal={() => setIsNewProductModalOpen(true)}
            />
          )}

          {currentView === 'customers' && (
            <CustomersView
              onOpenNewCustomerModal={() => setIsNewCustomerModalOpen(true)}
              onSelectOrder={handleSelectOrderFromAnywhere}
            />
          )}

          {currentView === 'deliveries' && (
            <DeliveriesView
              onSelectOrder={handleSelectOrderFromAnywhere}
            />
          )}

          {currentView === 'orders' && (
            <OrdersHistoryView
              onPrintOrder={(ord) => setReceiptOrder(ord)}
              selectedOrderFromOtherView={selectedOrderForHistory}
              onClearSelectedOrder={() => setSelectedOrderForHistory(null)}
            />
          )}

          {currentView === 'reports' && (
            <ReportsView />
          )}

          {currentView === 'settings' && (
            <SettingsView />
          )}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
