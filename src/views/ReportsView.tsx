import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart3,
  Calendar,
  DollarSign,
  Download,
  TrendingUp,
  AlertTriangle,
  PieChart,
  CreditCard,
  CheckCircle2,
  HelpCircle,
  Dog,
  ShoppingBag,
  Layers
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { orders, products, movements, settings } = useApp();

  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH'>('MONTH');

  const todayStr = '2026-10-24';
  const monthStr = '2026-10';

  // Filter orders by date
  const filteredOrders = orders.filter((o) => {
    if (o.orderStatus === 'CANCELADO') return false; // Exclude cancelled for operational revenue
    if (dateFilter === 'TODAY') return o.createdAt.startsWith(todayStr);
    if (dateFilter === 'MONTH') return o.createdAt.startsWith(monthStr);
    if (dateFilter === 'WEEK') {
      return o.createdAt >= '2026-10-17';
    }
    return true;
  });

  // Financial KPIs
  const totalSalesVolume = filteredOrders.reduce((sum, o) => sum + o.total, 0);
  const totalCollected = filteredOrders.reduce((sum, o) => sum + o.amountPaid, 0);
  const totalPendingBalance = filteredOrders.reduce((sum, o) => sum + o.balancePending, 0);

  // Cost of goods sold (COGS)
  const totalCostOfGoods = filteredOrders.reduce((sum, o) => {
    const orderCost = o.items.reduce((acc, item) => acc + item.costPrice * item.quantity, 0);
    return sum + orderCost;
  }, 0);

  // Gross profit estimation
  const grossProfit = totalSalesVolume - totalCostOfGoods;
  const grossMarginPercent = totalSalesVolume > 0 ? ((grossProfit / totalSalesVolume) * 100).toFixed(1) : '0';

  // Sales by bed size
  const salesBySize: Record<string, { count: number; revenue: number }> = {};
  filteredOrders.forEach((o) => {
    o.items.forEach((item) => {
      const sz = item.size || 'Otras';
      if (!salesBySize[sz]) {
        salesBySize[sz] = { count: 0, revenue: 0 };
      }
      salesBySize[sz].count += item.quantity;
      salesBySize[sz].revenue += item.subtotal;
    });
  });

  // Top selling bed models
  const productSalesMap: Record<string, { name: string; sku: string; units: number; revenue: number }> = {};
  filteredOrders.forEach((o) => {
    o.items.forEach((item) => {
      if (!productSalesMap[item.productId]) {
        productSalesMap[item.productId] = {
          name: item.productName,
          sku: item.productSku,
          units: 0,
          revenue: 0
        };
      }
      productSalesMap[item.productId].units += item.quantity;
      productSalesMap[item.productId].revenue += item.subtotal;
    });
  });

  const topProducts = Object.values(productSalesMap)
    .sort((a, b) => b.units - a.units)
    .slice(0, 5);

  // Payment method distribution
  const salesByPaymentMethod: Record<string, number> = {};
  filteredOrders.forEach((o) => {
    const pm = o.paymentMethod || 'Otros';
    salesByPaymentMethod[pm] = (salesByPaymentMethod[pm] || 0) + o.amountPaid;
  });

  // Export to CSV helper
  const exportSalesCSV = () => {
    const headers = ['Folio', 'Fecha', 'Cliente', 'Perrito', 'Telefono', 'Total_Venta', 'Monto_Pagado', 'Saldo_Pendiente', 'Estado_Pedido', 'Metodo_Pago'];
    const rows = filteredOrders.map((o) => [
      `"${o.folio}"`,
      `"${o.createdAt}"`,
      `"${o.customerName.replace(/"/g, '""')}"`,
      `"${(o.customerPetName || '').replace(/"/g, '""')}"`,
      `"${o.customerPhone}"`,
      o.total,
      o.amountPaid,
      o.balancePending,
      `"${o.orderStatus}"`,
      `"${o.paymentMethod}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reporte_ventas_dogzzz_${dateFilter.toLowerCase()}_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportMovementsCSV = () => {
    const headers = ['ID_Movimiento', 'Fecha', 'SKU', 'Producto', 'Tipo', 'Cantidad', 'Stock_Previo', 'Nuevo_Stock', 'Motivo', 'Registrado_Por'];
    const rows = movements.map((m) => [
      `"${m.id}"`,
      `"${m.createdAt}"`,
      `"${m.productSku}"`,
      `"${m.productName.replace(/"/g, '""')}"`,
      `"${m.type}"`,
      m.quantity,
      m.previousStock,
      m.newStock,
      `"${m.reason.replace(/"/g, '""')}"`,
      `"${m.registeredBy}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `movimientos_inventario_dogzzz_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-[#2C1810]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFDF9] p-5 rounded-2xl border border-[#E8DFD5] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#4A6B53]/15 text-[#4A6B53] flex items-center justify-center">
              <BarChart3 className="w-4.5 h-4.5" />
            </div>
            <h1 className="text-xl font-bold text-[#2C1810] tracking-tight">Reportes y Finanzas DogZzz</h1>
          </div>
          <p className="text-xs text-[#6B5A4E] mt-1">
            Análisis de facturación de camas para perros, cobros en caja, márgenes brutos y ventas por talla.
          </p>
        </div>

        {/* Date Filter & Export */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-[#FAF7F2] rounded-xl border border-[#E8DFD5] text-xs">
            <button
              onClick={() => setDateFilter('TODAY')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                dateFilter === 'TODAY' ? 'bg-white shadow-xs text-[#2C1810]' : 'text-[#8C7A6B] hover:text-[#2C1810]'
              }`}
            >
              Hoy
            </button>
            <button
              onClick={() => setDateFilter('WEEK')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                dateFilter === 'WEEK' ? 'bg-white shadow-xs text-[#2C1810]' : 'text-[#8C7A6B] hover:text-[#2C1810]'
              }`}
            >
              Últimos 7 días
            </button>
            <button
              onClick={() => setDateFilter('MONTH')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                dateFilter === 'MONTH' ? 'bg-white shadow-xs text-[#2C1810]' : 'text-[#8C7A6B] hover:text-[#2C1810]'
              }`}
            >
              Este Mes (Octubre)
            </button>
            <button
              onClick={() => setDateFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                dateFilter === 'ALL' ? 'bg-white shadow-xs text-[#2C1810]' : 'text-[#8C7A6B] hover:text-[#2C1810]'
              }`}
            >
              Histórico
            </button>
          </div>

          <button
            onClick={exportSalesCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#4A6B53] text-white rounded-xl text-xs font-semibold hover:bg-[#3D5944] shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Financial Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* KPI 1: Ventas Totales */}
        <div className="bg-[#FFFDF9] p-4 rounded-2xl border border-[#E8DFD5] shadow-xs">
          <div className="flex items-center justify-between text-[#6B5A4E] mb-1">
            <span className="text-xs font-semibold">Ventas Totales</span>
            <DollarSign className="w-4 h-4 text-[#4A6B53]" />
          </div>
          <p className="text-xl font-bold font-mono text-[#2C1810] tabular-nums">
            ${totalSalesVolume.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-[#8C7A6B] mt-1">
            {filteredOrders.length} pedido(s) activos
          </p>
        </div>

        {/* KPI 2: Cobrado en Caja */}
        <div className="bg-[#FFFDF9] p-4 rounded-2xl border border-[#E8DFD5] shadow-xs">
          <div className="flex items-center justify-between text-[#6B5A4E] mb-1">
            <span className="text-xs font-semibold">Cobrado Real</span>
            <CheckCircle2 className="w-4 h-4 text-[#4A6B53]" />
          </div>
          <p className="text-xl font-bold font-mono text-[#4A6B53] tabular-nums">
            ${totalCollected.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-[#8C7A6B] mt-1">
            Flujo de efectivo ingresado
          </p>
        </div>

        {/* KPI 3: Cuentas por Cobrar */}
        <div className="bg-[#FFFDF9] p-4 rounded-2xl border border-[#E8DFD5] shadow-xs">
          <div className="flex items-center justify-between text-[#6B5A4E] mb-1">
            <span className="text-xs font-semibold">Por Cobrar</span>
            <AlertTriangle className="w-4 h-4 text-[#C25E42]" />
          </div>
          <p className={`text-xl font-bold font-mono tabular-nums ${totalPendingBalance > 0 ? 'text-[#C25E42]' : 'text-[#4A6B53]'}`}>
            ${totalPendingBalance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-[#8C7A6B] mt-1">
            Saldos contra entrega
          </p>
        </div>

        {/* KPI 4: Costo de Mercancía */}
        <div className="bg-[#FFFDF9] p-4 rounded-2xl border border-[#E8DFD5] shadow-xs">
          <div className="flex items-center justify-between text-[#6B5A4E] mb-1">
            <span className="text-xs font-semibold">Costo de Camas</span>
            <Dog className="w-4 h-4 text-[#8C7A6B]" />
          </div>
          <p className="text-xl font-bold font-mono text-[#4A3B32] tabular-nums">
            ${totalCostOfGoods.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-[#8C7A6B] mt-1">
            Costo de fabricación / compra
          </p>
        </div>

        {/* KPI 5: Margen Bruto */}
        <div className="bg-[#FFFDF9] p-4 rounded-2xl border border-[#E8DFD5] shadow-xs">
          <div className="flex items-center justify-between text-[#6B5A4E] mb-1">
            <span className="text-xs font-semibold">Margen Bruto Est.</span>
            <TrendingUp className="w-4 h-4 text-[#4A6B53]" />
          </div>
          <p className="text-xl font-bold font-mono text-[#4A6B53] tabular-nums">
            ${grossProfit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-[#6B5A4E] mt-1 font-semibold">
            Margen: {grossMarginPercent}% sobre venta
          </p>
        </div>
      </div>

      {/* Explanatory Note on Margins */}
      <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E8DFD5] text-[#6B5A4E] text-xs flex items-start gap-2.5">
        <HelpCircle className="w-4 h-4 text-[#8C7A6B] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Aclaración financiera DogZzz:</strong> El "Margen Bruto Estimado" representa la diferencia directa entre el precio de venta cobrado y el costo de materiales/fabricación de las camas para perros. No descuenta gastos operativos fijos (renta de tienda, nómina, combustible de camionetas de reparto o comisiones bancarias).
        </p>
      </div>

      {/* 2-Column Analytical Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Bed Size */}
        <div className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#E8DFD5] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8DFD5] pb-3">
            <div>
              <h3 className="font-bold text-[#2C1810] text-sm">Ventas por Talla de Cama Canina</h3>
              <p className="text-xs text-[#6B5A4E]">Volumen de camas e ingresos por tamaño (XS a XXL)</p>
            </div>
            <Dog className="w-4 h-4 text-[#4A6B53]" />
          </div>

          <div className="space-y-3">
            {Object.keys(salesBySize).length === 0 ? (
              <p className="text-xs text-[#8C7A6B] py-4 text-center">No hay ventas registradas en este periodo.</p>
            ) : (
              Object.entries(salesBySize).map(([sizeName, data]) => {
                const percent = totalSalesVolume > 0 ? (data.revenue / totalSalesVolume) * 100 : 0;
                return (
                  <div key={sizeName} className="space-y-1 text-xs">
                    <div className="flex justify-between items-center text-[#4A3B32]">
                      <span className="font-bold text-[#2C1810] flex items-center gap-1.5">
                        <span className="w-6 h-5 rounded bg-[#4A6B53]/15 text-[#4A6B53] font-mono text-[10px] font-bold flex items-center justify-center">
                          {sizeName}
                        </span>
                        Talla {sizeName}
                      </span>
                      <div className="flex items-center gap-3 font-mono">
                        <span className="text-[#6B5A4E]">{data.count} cama(s)</span>
                        <span className="font-bold text-[#2C1810]">
                          ${data.revenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full h-2 bg-[#FAF7F2] rounded-full overflow-hidden border border-[#E8DFD5]/50">
                      <div
                        className="h-full bg-[#4A6B53] rounded-full transition-all"
                        style={{ width: `${Math.min(100, Math.max(5, percent))}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Top 5 Best Selling Models */}
        <div className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#E8DFD5] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8DFD5] pb-3">
            <div>
              <h3 className="font-bold text-[#2C1810] text-sm">Top 5 Modelos de Camas Más Vendidos</h3>
              <p className="text-xs text-[#6B5A4E]">Modelos caninos con mayor rotación y preferencia</p>
            </div>
            <TrendingUp className="w-4 h-4 text-[#4A6B53]" />
          </div>

          <div className="space-y-2.5">
            {topProducts.length === 0 ? (
              <p className="text-xs text-[#8C7A6B] py-4 text-center">No hay productos vendidos en este periodo.</p>
            ) : (
              topProducts.map((p, idx) => (
                <div key={p.sku} className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5] text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-[#4A6B53]/20 text-[#4A6B53] font-bold flex items-center justify-center text-xs shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-[#2C1810] truncate">{p.name}</p>
                      <p className="text-[10px] font-mono text-[#6B5A4E]">{p.sku}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-bold font-mono text-[#2C1810]">
                      {p.units} pieza(s)
                    </span>
                    <p className="text-[11px] text-[#4A6B53] font-mono font-semibold">
                      ${p.revenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Payment Methods & Movement Export */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods Breakdown */}
        <div className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#E8DFD5] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8DFD5] pb-3">
            <div>
              <h3 className="font-bold text-[#2C1810] text-sm">Cobros por Método de Pago</h3>
              <p className="text-xs text-[#6B5A4E]">Distribución de ingresos en mostrador y transferencia</p>
            </div>
            <CreditCard className="w-4 h-4 text-[#8C7A6B]" />
          </div>

          <div className="divide-y divide-[#E8DFD5]/60 text-xs">
            {Object.entries(salesByPaymentMethod).map(([method, amount]) => (
              <div key={method} className="py-2.5 flex justify-between items-center">
                <span className="font-semibold text-[#4A3B32]">{method}</span>
                <span className="font-mono font-bold text-[#2C1810]">
                  ${amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory Export & Audit */}
        <div className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#E8DFD5] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#E8DFD5] pb-3 mb-4">
              <div>
                <h3 className="font-bold text-[#2C1810] text-sm">Auditoría de Almacén DogZzz</h3>
                <p className="text-xs text-[#6B5A4E]">Bitácora de entradas, salidas y mermas</p>
              </div>
              <Download className="w-4 h-4 text-[#8C7A6B]" />
            </div>

            <p className="text-xs text-[#6B5A4E] leading-relaxed mb-4">
              Descarga la bitácora completa de todas las entradas por recepción de camas del taller de costura, salidas por ventas en mostrador, devoluciones por cancelaciones y ajustes con su motivo y empleado responsable.
            </p>
          </div>

          <div className="pt-4 border-t border-[#E8DFD5] flex items-center justify-between">
            <span className="text-xs text-[#6B5A4E] font-mono">
              {movements.length} movimientos caninos registrados
            </span>
            <button
              onClick={exportMovementsCSV}
              className="flex items-center gap-2 px-4 py-2 bg-[#2C1810] text-white rounded-xl text-xs font-semibold hover:bg-[#1A0E0A] shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Descargar CSV de Almacén</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
