import React from 'react';
import { useApp } from '../context/AppContext';
import { NavView } from '../components/Sidebar';
import {
  DollarSign,
  TrendingUp,
  Dog,
  AlertTriangle,
  Clock,
  CalendarCheck,
  Truck,
  PlusCircle,
  ShoppingCart,
  Users,
  ClipboardList,
  ArrowRight,
  Sparkles,
  Heart,
  CheckCircle2,
  PackageCheck,
  Star
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (view: NavView) => void;
  onOpenNewProductModal: () => void;
  onOpenNewCustomerModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenNewProductModal,
  onOpenNewCustomerModal
}) => {
  const { orders, products, movements, settings } = useApp();

  const todayStr = '2026-10-24';
  const currentMonthStr = todayStr.substring(0, 7);

  const validOrders = orders.filter((o) => o.orderStatus !== 'CANCELADO');

  // Ventas del día
  const todayOrders = validOrders.filter((o) => o.createdAt.startsWith(todayStr));
  const todaySalesTotal = todayOrders.reduce((sum, o) => sum + o.total, 0);

  // Ventas del mes
  const monthOrders = validOrders.filter((o) => o.createdAt.startsWith(currentMonthStr));
  const monthSalesTotal = monthOrders.reduce((sum, o) => sum + o.total, 0);

  // Camas disponibles en inventario
  const totalStockUnits = products
    .filter((p) => p.isActive)
    .reduce((sum, p) => sum + p.stock, 0);

  // Modelos con pocas existencias
  const lowStockProducts = products.filter((p) => p.isActive && p.stock <= p.minStockAlert && p.stock > 0);
  
  // Variantes / Modelos agotados
  const outOfStockProducts = products.filter((p) => p.isActive && p.stock === 0);

  // Contar variantes agotadas específicamente en todos los productos
  let outOfStockVariantsCount = 0;
  products.forEach((p) => {
    if (p.variants && p.variants.length > 0) {
      outOfStockVariantsCount += p.variants.filter((v) => v.stock === 0).length;
    } else if (p.stock === 0) {
      outOfStockVariantsCount += 1;
    }
  });

  // Pedidos pendientes
  const pendingOrders = orders.filter(
    (o) => o.orderStatus !== 'COMPLETADO' && o.orderStatus !== 'CANCELADO'
  );

  // Entregas programadas para hoy
  const todayDeliveries = orders.filter(
    (o) =>
      o.delivery.required &&
      o.delivery.scheduledDate === todayStr &&
      ['PROGRAMADA', 'EN_PREPARACION', 'EN_CAMINO'].includes(o.delivery.status)
  );

  // Entregas atrasadas
  const delayedDeliveries = orders.filter(
    (o) =>
      o.delivery.required &&
      o.delivery.scheduledDate &&
      o.delivery.scheduledDate < todayStr &&
      !['ENTREGADA', 'CANCELADA'].includes(o.delivery.status)
  );

  // Productos destacados para la sección especial
  const featuredBeds = products.filter((p) => p.isActive && (p.isFeatured || p.stock > 0)).slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Welcome & Store Header with DogZzz Logo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-[#EADFD5] shadow-xs">
        <div className="flex items-center gap-4">
          <img
            src={settings.logoUrl || '/src/assets/images/dogzzz_brand_logo_1792871852948.jpg'}
            alt="DogZzz"
            referrerPolicy="no-referrer"
            className="w-14 h-14 rounded-full object-cover border-2 border-[#D9CABE] shadow-xs shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#382417] tracking-tight">
                Panel de Control · {settings.businessName}
              </h1>
              <span className="text-[10px] bg-[#EAF1EB] text-[#3B5742] font-bold px-2 py-0.5 rounded border border-[#C5DAC8]">
                🐾 Especialistas Caninos
              </span>
            </div>
            <p className="text-xs text-[#7A6150] mt-1">
              "{settings.slogan}" — Resumen de inventario, punto de venta y entregas para consentir a los perritos.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('pos')}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#C25E42] hover:bg-[#B04D32] rounded-lg shadow-xs transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Punto de Venta</span>
          </button>
          <button
            onClick={() => onNavigate('inventory')}
            className="flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold text-[#382417] bg-[#F0EAE1] hover:bg-[#E5DCD0] rounded-lg transition-colors border border-[#D9CABE]"
          >
            <Dog className="w-4 h-4 text-[#4A6B53]" />
            <span>Catálogo de Camas</span>
          </button>
        </div>
      </div>

      {/* Critical Stock Alert Banner */}
      {(lowStockProducts.length > 0 || outOfStockVariantsCount > 0) && (
        <div className="p-4 rounded-xl bg-[#FAF0EC] border border-[#F3CEC2] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#F7D8CE] text-[#B04D32] flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#8C341C]">
                Alerta de Existencias: {lowStockProducts.length} modelo(s) con pocas existencias y {outOfStockVariantsCount} variante(s) agotada(s).
              </p>
              <p className="text-[11px] text-[#A64A30] mt-0.5">
                Revisa el catálogo para surtir a tiempo las camas favoritas de los perrhijos.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('inventory')}
            className="text-xs font-bold text-[#B04D32] hover:underline shrink-0 self-start sm:self-center"
          >
            Ver catálogo a reabastecer →
          </button>
        </div>
      )}

      {/* 8 Primary DogZzz Real Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1: Ventas de Hoy */}
        <div className="bg-white p-4 rounded-xl border border-[#EADFD5] shadow-xs">
          <div className="flex items-center justify-between text-[#7A6150] mb-2">
            <span className="text-xs font-semibold">Ventas de Hoy</span>
            <DollarSign className="w-4 h-4 text-[#4A6B53]" />
          </div>
          <p className="text-xl font-bold text-[#382417] font-mono tabular-nums">
            ${todaySalesTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-[#7A6150] mt-1">
            {todayOrders.length} compra(s) hoy
          </p>
        </div>

        {/* Metric 2: Ventas del Mes */}
        <div className="bg-white p-4 rounded-xl border border-[#EADFD5] shadow-xs">
          <div className="flex items-center justify-between text-[#7A6150] mb-2">
            <span className="text-xs font-semibold">Ventas del Mes</span>
            <TrendingUp className="w-4 h-4 text-[#4A6B53]" />
          </div>
          <p className="text-xl font-bold text-[#382417] font-mono tabular-nums">
            ${monthSalesTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-[#7A6150] mt-1">
            {monthOrders.length} pedidos acumulados
          </p>
        </div>

        {/* Metric 3: Camas disponibles */}
        <div className="bg-white p-4 rounded-xl border border-[#EADFD5] shadow-xs">
          <div className="flex items-center justify-between text-[#7A6150] mb-2">
            <span className="text-xs font-semibold">Camas en Inventario</span>
            <Dog className="w-4 h-4 text-[#4A6B53]" />
          </div>
          <p className="text-xl font-bold text-[#382417] font-mono tabular-nums">
            {totalStockUnits} <span className="text-xs font-normal text-[#7A6150]">piezas</span>
          </p>
          <p className="text-[11px] text-[#7A6150] mt-1">
            En {products.filter((p) => p.isActive).length} modelos activos
          </p>
        </div>

        {/* Metric 4: Modelos con existencias bajas */}
        <div className="bg-white p-4 rounded-xl border border-[#EADFD5] shadow-xs">
          <div className="flex items-center justify-between text-[#7A6150] mb-2">
            <span className="text-xs font-semibold">Pocas Existencias</span>
            <AlertTriangle className="w-4 h-4 text-[#C25E42]" />
          </div>
          <p className={`text-xl font-bold font-mono tabular-nums ${lowStockProducts.length > 0 ? 'text-[#C25E42]' : 'text-[#382417]'}`}>
            {lowStockProducts.length} <span className="text-xs font-normal text-[#7A6150]">modelos</span>
          </p>
          <p className="text-[11px] text-[#7A6150] mt-1">
            {outOfStockVariantsCount} variante(s) en cero
          </p>
        </div>

        {/* Metric 5: Pedidos pendientes */}
        <div className="bg-white p-4 rounded-xl border border-[#EADFD5] shadow-xs">
          <div className="flex items-center justify-between text-[#7A6150] mb-2">
            <span className="text-xs font-semibold">Pedidos Pendientes</span>
            <Clock className="w-4 h-4 text-[#7A6150]" />
          </div>
          <p className="text-xl font-bold text-[#382417] font-mono tabular-nums">
            {pendingOrders.length}
          </p>
          <p className="text-[11px] text-[#7A6150] mt-1">
            Por entregar o retirar
          </p>
        </div>

        {/* Metric 6: Entregas para hoy */}
        <div className="bg-white p-4 rounded-xl border border-[#EADFD5] shadow-xs">
          <div className="flex items-center justify-between text-[#7A6150] mb-2">
            <span className="text-xs font-semibold">Entregas de Hoy</span>
            <CalendarCheck className="w-4 h-4 text-[#4A6B53]" />
          </div>
          <p className="text-xl font-bold text-[#382417] font-mono tabular-nums">
            {todayDeliveries.length}
          </p>
          <p className="text-[11px] text-[#7A6150] mt-1">
            Fletes programados para hoy
          </p>
        </div>

        {/* Metric 7: Entregas atrasadas */}
        <div className="bg-white p-4 rounded-xl border border-[#EADFD5] shadow-xs">
          <div className="flex items-center justify-between text-[#7A6150] mb-2">
            <span className="text-xs font-semibold">Entregas Atrasadas</span>
            <Truck className="w-4 h-4 text-[#C25E42]" />
          </div>
          <p className={`text-xl font-bold font-mono tabular-nums ${delayedDeliveries.length > 0 ? 'text-[#C25E42]' : 'text-[#382417]'}`}>
            {delayedDeliveries.length}
          </p>
          <p className="text-[11px] text-[#7A6150] mt-1">
            Requieren reprogramar
          </p>
        </div>

        {/* Metric 8: Variantes Agotadas */}
        <div className="bg-white p-4 rounded-xl border border-[#EADFD5] shadow-xs">
          <div className="flex items-center justify-between text-[#7A6150] mb-2">
            <span className="text-xs font-semibold">Variantes Agotadas</span>
            <AlertTriangle className="w-4 h-4 text-[#A89689]" />
          </div>
          <p className="text-xl font-bold text-[#382417] font-mono tabular-nums">
            {outOfStockVariantsCount}
          </p>
          <p className="text-[11px] text-[#7A6150] mt-1">
            Tallas o colores agotados
          </p>
        </div>
      </div>

      {/* SECTION: PRODUCTOS DESTACADOS (FEATURED DOG BEDS) */}
      <div className="bg-white p-6 rounded-xl border border-[#EADFD5] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#F0EAE1] pb-3">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-[#C25E42] fill-[#C25E42]" />
            <h2 className="text-sm font-bold text-[#382417] uppercase tracking-wider">
              Productos Destacados de DogZzz
            </h2>
            <span className="text-[11px] text-[#7A6150] hidden sm:inline">
              (Camas favoritas para consentir a los perritos)
            </span>
          </div>

          <button
            onClick={() => onNavigate('inventory')}
            className="text-xs font-bold text-[#4A6B53] hover:text-[#3B5742] flex items-center gap-1"
          >
            <span>Ver todo el catálogo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredBeds.map((bed) => (
            <div
              key={bed.id}
              className="bg-[#FAF7F2] rounded-xl border border-[#EADFD5] overflow-hidden hover:border-[#4A6B53] transition-all shadow-xs flex flex-col justify-between"
            >
              <div className="relative aspect-4/3 bg-white">
                <img
                  src={bed.photoUrl || '/src/assets/images/dog_bed_donut_plush_1792871854634.jpg'}
                  alt={bed.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-[#FAF7F2]/90 text-[#382417] shadow-xs">
                  {bed.bedType}
                </span>
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-[#4A6B53] text-white shadow-xs">
                  {bed.stock} disp.
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-bold text-xs text-[#382417] line-clamp-1 leading-snug">
                    {bed.name}
                  </h3>
                  {bed.recommendedBreed && (
                    <p className="text-[10px] text-[#4A6B53] font-semibold mt-1 line-clamp-1">
                      🐶 {bed.recommendedBreed}
                    </p>
                  )}
                  <p className="text-[11px] text-[#7A6150] mt-1 line-clamp-2 leading-relaxed">
                    {bed.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#EADFD5] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#8C7565]">Desde:</span>
                    <p className="text-sm font-bold font-mono text-[#382417]">
                      ${bed.salePrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <button
                    onClick={() => onNavigate('pos')}
                    className="px-3 py-1.5 bg-[#C25E42] hover:bg-[#B04D32] text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                  >
                    Vender
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6 Direct Shortcuts for DogZzz Operations */}
      <div className="bg-white p-6 rounded-xl border border-[#EADFD5] shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-[#382417] uppercase tracking-wider">
            Accesos Rápidos de Operación
          </h2>
          <span className="text-xs text-[#7A6150]">Operaciones de mostrador a 1 clic</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* 1. Registrar venta */}
          <button
            onClick={() => onNavigate('pos')}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-[#EADFD5] hover:border-[#C25E42] hover:bg-[#FAF0EC] text-[#382417] transition-all text-center group"
          >
            <div className="w-10 h-10 rounded-full bg-[#FAF0EC] text-[#C25E42] flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold leading-snug">1. Registrar Venta</span>
            <span className="text-[10px] text-[#7A6150] mt-0.5">Cobro y ticket DogZzz</span>
          </button>

          {/* 2. Agregar cama */}
          <button
            onClick={onOpenNewProductModal}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-[#EADFD5] hover:border-[#4A6B53] hover:bg-[#EAF1EB] text-[#382417] transition-all text-center group"
          >
            <div className="w-10 h-10 rounded-full bg-[#EAF1EB] text-[#4A6B53] flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <PlusCircle className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold leading-snug">2. Agregar Cama</span>
            <span className="text-[10px] text-[#7A6150] mt-0.5">Nuevo modelo o talla</span>
          </button>

          {/* 3. Consultar inventario */}
          <button
            onClick={() => onNavigate('inventory')}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-[#EADFD5] hover:border-[#4A6B53] hover:bg-[#FAF7F2] text-[#382417] transition-all text-center group"
          >
            <div className="w-10 h-10 rounded-full bg-[#F0EAE1] text-[#5C3D2E] flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <Dog className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold leading-snug">3. Catálogo</span>
            <span className="text-[10px] text-[#7A6150] mt-0.5">Stock de variantes</span>
          </button>

          {/* 4. Registrar cliente y mascota */}
          <button
            onClick={onOpenNewCustomerModal}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-[#EADFD5] hover:border-[#4A6B53] hover:bg-[#FAF7F2] text-[#382417] transition-all text-center group"
          >
            <div className="w-10 h-10 rounded-full bg-[#F0EAE1] text-[#5C3D2E] flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold leading-snug">4. Alta Dueño/Perrito</span>
            <span className="text-[10px] text-[#7A6150] mt-0.5">Datos y raza</span>
          </button>

          {/* 5. Programar entrega */}
          <button
            onClick={() => onNavigate('deliveries')}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-[#EADFD5] hover:border-[#4A6B53] hover:bg-[#FAF7F2] text-[#382417] transition-all text-center group"
          >
            <div className="w-10 h-10 rounded-full bg-[#F0EAE1] text-[#5C3D2E] flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <Truck className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold leading-snug">5. Entregas Caninas</span>
            <span className="text-[10px] text-[#7A6150] mt-0.5">Fletes a domicilio</span>
          </button>

          {/* 6. Consultar pedidos */}
          <button
            onClick={() => onNavigate('orders')}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-[#EADFD5] hover:border-[#4A6B53] hover:bg-[#FAF7F2] text-[#382417] transition-all text-center group"
          >
            <div className="w-10 h-10 rounded-full bg-[#F0EAE1] text-[#5C3D2E] flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <ClipboardList className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold leading-snug">6. Historial</span>
            <span className="text-[10px] text-[#7A6150] mt-0.5">Folios y abonos</span>
          </button>
        </div>
      </div>

      {/* Two columns: Recent Activity & Inventory movements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white p-6 rounded-xl border border-[#EADFD5] shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE1]">
            <div>
              <h3 className="text-sm font-bold text-[#382417]">Últimas Ventas en Tienda DogZzz</h3>
              <p className="text-xs text-[#7A6150]">Pedidos recientes de camas para consentir lomitos</p>
            </div>
            <button
              onClick={() => onNavigate('orders')}
              className="text-xs text-[#4A6B53] hover:text-[#3B5742] font-bold flex items-center gap-1"
            >
              <span>Ver todas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-[#F2ECE4] mt-2">
            {orders.slice(0, 5).map((order) => {
              let statusLabel = 'Confirmado';
              let statusColor = 'bg-[#F0EAE1] text-[#382417]';

              if (order.orderStatus === 'COMPLETADO') {
                statusLabel = 'Completado';
                statusColor = 'bg-[#EAF1EB] text-[#3B5742]';
              } else if (order.orderStatus === 'CANCELADO') {
                statusLabel = 'Cancelado';
                statusColor = 'bg-[#FAF0EC] text-[#C25E42]';
              } else if (order.orderStatus === 'LISTO_RECOGER') {
                statusLabel = 'Listo en tienda';
                statusColor = 'bg-[#FAF7F2] text-[#5C3D2E]';
              } else if (order.orderStatus === 'EN_CAMINO') {
                statusLabel = 'En camino';
                statusColor = 'bg-[#EAF1EB] text-[#3B5742]';
              }

              return (
                <div key={order.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#382417]">{order.folio}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${statusColor}`}>
                        {statusLabel}
                      </span>
                    </div>
                    <p className="text-[#5C3D2E] truncate mt-0.5">
                      {order.customerName} {order.petName ? `(🐶 ${order.petName})` : ''}
                    </p>
                    <p className="text-[10px] text-[#A89689]">
                      {new Date(order.createdAt).toLocaleDateString('es-MX', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-mono font-bold text-[#382417] tabular-nums">
                      ${order.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </p>
                    {order.balancePending > 0 ? (
                      <p className="text-[10px] text-[#C25E42] font-bold">
                        Saldo: ${order.balancePending.toLocaleString('es-MX')}
                      </p>
                    ) : (
                      <p className="text-[10px] text-[#4A6B53] font-semibold">Liquidado</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Inventory Movements */}
        <div className="bg-white p-6 rounded-xl border border-[#EADFD5] shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE1]">
            <div>
              <h3 className="text-sm font-bold text-[#382417]">Movimientos de Almacén Canino</h3>
              <p className="text-xs text-[#7A6150]">Entradas de fábrica, salidas por venta y ajustes</p>
            </div>
            <button
              onClick={() => onNavigate('inventory')}
              className="text-xs text-[#4A6B53] hover:text-[#3B5742] font-bold flex items-center gap-1"
            >
              <span>Ver almacén</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-[#F2ECE4] mt-2">
            {movements.slice(0, 5).map((mov) => {
              const isPositive = mov.quantity > 0;
              return (
                <div key={mov.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <p className="font-bold text-[#382417] truncate">{mov.productName}</p>
                    {mov.variantInfo && (
                      <span className="text-[10px] text-[#4A6B53] font-semibold block">
                        {mov.variantInfo}
                      </span>
                    )}
                    <p className="text-[#7A6150] text-[11px] truncate mt-0.5">
                      {mov.reason}
                    </p>
                    <p className="text-[10px] text-[#A89689]">
                      {new Date(mov.createdAt).toLocaleDateString('es-MX', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })} · {mov.registeredBy}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                        isPositive ? 'bg-[#EAF1EB] text-[#3B5742]' : 'bg-[#FAF7F2] text-[#382417]'
                      }`}
                    >
                      {isPositive ? `+${mov.quantity}` : mov.quantity}
                    </span>
                    <p className="text-[10px] text-[#7A6150] mt-1">
                      Stock: {mov.newStock}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
