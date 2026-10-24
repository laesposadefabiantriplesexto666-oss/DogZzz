import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product, ProductVariant, Customer, SaleCartItem, PaymentMethod, Order } from '../types';
import {
  ShoppingCart,
  Search,
  UserPlus,
  Plus,
  Minus,
  Trash2,
  DollarSign,
  Truck,
  Store,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  Dog,
  Sparkles,
  Layers,
  Heart
} from 'lucide-react';

interface SalesPosViewProps {
  onOpenNewCustomerModal: () => void;
  onSaleCompleted: (order: Order) => void;
}

export const SalesPosView: React.FC<SalesPosViewProps> = ({
  onOpenNewCustomerModal,
  onSaleCompleted
}) => {
  const { products, customers, processSale, settings, isAdmin } = useApp();

  // Search & selections
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const [productSearch, setProductSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [sizeFilter, setSizeFilter] = useState('ALL');

  // Selected variant selection temporary state map (productId -> variantId)
  const [selectedVariantByProduct, setSelectedVariantByProduct] = useState<Record<string, string>>({});

  // Cart
  const [cart, setCart] = useState<SaleCartItem[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [deliveryType, setDeliveryType] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY');
  const [deliveryFee, setDeliveryFee] = useState<number>(settings.defaultDeliveryFee);
  const [deliveryDate, setDeliveryDate] = useState<string>('2026-10-25');
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState<string>('10:00 - 14:00');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [deliveryReferences, setDeliveryReferences] = useState<string>('');
  const [deliveryNotes, setDeliveryNotes] = useState<string>('');

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Efectivo');
  const [paymentType, setPaymentType] = useState<'FULL' | 'PARTIAL'>('FULL');
  const [partialAmount, setPartialAmount] = useState<number>(0);
  const [cashGiven, setCashGiven] = useState<number>(0);
  const [paymentNotes, setPaymentNotes] = useState<string>('');
  const [generalNotes, setGeneralNotes] = useState<string>('');

  // Confirmation dialog
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectCustomer = (cust: Customer) => {
    setSelectedCustomer(cust);
    setDeliveryAddress(cust.deliveryAddress || '');
    setDeliveryReferences(cust.addressReferences || '');
  };

  // Cart operations
  const addToCart = (product: Product) => {
    const chosenVariantId = selectedVariantByProduct[product.id] || product.variants?.[0]?.id;
    const variant = chosenVariantId ? product.variants.find((v) => v.id === chosenVariantId) : null;

    const availableStock = variant ? variant.stock : product.stock;
    const unitPrice = variant ? variant.salePrice : product.salePrice;
    const variantSku = variant ? variant.sku : product.sku;
    const size = variant ? variant.size : product.size;
    const color = variant ? variant.color : product.color;
    const dimensions = variant ? variant.dimensions : product.dimensions;

    if (availableStock <= 0) {
      alert('Esta variante de cama para perros está agotada.');
      return;
    }

    setCart((prev) => {
      const existing = prev.find(
        (item) => item.product.id === product.id && item.variantId === chosenVariantId
      );

      if (existing) {
        if (existing.quantity >= availableStock) {
          alert(`No puedes agregar más de las ${availableStock} piezas disponibles en esta variante.`);
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id && item.variantId === chosenVariantId
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * item.unitPrice
              }
            : item
        );
      } else {
        return [
          ...prev,
          {
            product,
            variantId: chosenVariantId,
            variantSku,
            size,
            color,
            dimensions,
            quantity: 1,
            unitPrice,
            discount: 0,
            subtotal: unitPrice
          }
        ];
      }
    });
  };

  const updateCartQty = (productId: string, variantId: string | undefined, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(productId, variantId);
      return;
    }

    const prod = products.find((p) => p.id === productId);
    const variant = variantId && prod ? prod.variants.find((v) => v.id === variantId) : null;
    const maxStock = variant ? variant.stock : (prod?.stock || 0);

    if (newQty > maxStock) {
      alert(`Existencias insuficientes para esta variante. Máximo disponible: ${maxStock}`);
      return;
    }

    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId && item.variantId === variantId
          ? {
              ...item,
              quantity: newQty,
              subtotal: newQty * item.unitPrice
            }
          : item
      )
    );
  };

  const removeFromCart = (productId: string, variantId: string | undefined) => {
    setCart((prev) => prev.filter((item) => !(item.product.id === productId && item.variantId === variantId)));
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setCashGiven(0);
    setPartialAmount(0);
  };

  // Financial calculations
  const rawSubtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const currentDeliveryFee = deliveryType === 'DELIVERY' ? deliveryFee : 0;
  const grandTotal = Math.max(0, rawSubtotal - discount + currentDeliveryFee);

  const amountToPayNow = paymentType === 'FULL' ? grandTotal : Math.min(grandTotal, partialAmount);
  const remainingBalance = Math.max(0, grandTotal - amountToPayNow);
  const changeToGive = paymentMethod === 'Efectivo' && cashGiven > amountToPayNow ? cashGiven - amountToPayNow : 0;

  // Filtered products for POS
  const availableProducts = products.filter((p) => {
    if (!p.isActive) return false;
    if (typeFilter !== 'ALL' && p.bedType !== typeFilter) return false;
    if (sizeFilter !== 'ALL') {
      const hasSize = p.size === sizeFilter || (p.variants && p.variants.some((v) => v.size === sizeFilter));
      if (!hasSize) return false;
    }
    if (productSearch) {
      const s = productSearch.toLowerCase();
      return (
        p.name.toLowerCase().includes(s) ||
        p.sku.toLowerCase().includes(s) ||
        (p.recommendedBreed && p.recommendedBreed.toLowerCase().includes(s))
      );
    }
    return true;
  });

  // Filtered customer search
  const filteredCustomers = customerSearch.trim()
    ? customers.filter((c) =>
        c.fullName.toLowerCase().includes(customerSearch.toLowerCase()) ||
        c.phone.includes(customerSearch) ||
        (c.petName && c.petName.toLowerCase().includes(customerSearch.toLowerCase()))
      )
    : [];

  const handleFinalizeSale = () => {
    if (!selectedCustomer) {
      alert('Por favor selecciona o registra al dueño/cliente de la mascota.');
      return;
    }
    if (cart.length === 0) {
      alert('El carrito no contiene camas para perros.');
      return;
    }
    if (deliveryType === 'DELIVERY' && !deliveryAddress.trim()) {
      alert('Ingresa la dirección de entrega para el envío a domicilio.');
      return;
    }

    setIsSubmitting(true);

    const result = processSale({
      customer: selectedCustomer,
      items: cart,
      subtotal: rawSubtotal,
      discount,
      deliveryFee: currentDeliveryFee,
      total: grandTotal,
      initialPayment: amountToPayNow,
      paymentMethod,
      paymentNotes,
      delivery: {
        required: deliveryType === 'DELIVERY',
        scheduledDate: deliveryType === 'DELIVERY' ? deliveryDate : undefined,
        timeSlot: deliveryType === 'DELIVERY' ? deliveryTimeSlot : undefined,
        address: deliveryType === 'DELIVERY' ? deliveryAddress : 'Mostrador Tienda DogZzz',
        references: deliveryReferences,
        deliveryNotes
      },
      generalNotes
    });

    setIsSubmitting(false);
    setShowConfirmModal(false);

    if (result.success && result.order) {
      onSaleCompleted(result.order);
      clearCart();
      setSelectedCustomer(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* POS Top Header with DogZzz branding */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-xl border border-[#EADFD5] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-[#C25E42]" />
            <h1 className="text-xl font-bold text-[#382417] tracking-tight">
              Punto de Venta DogZzz · Venta de Camas para Perros
            </h1>
          </div>
          <p className="text-xs text-[#7A6150] mt-1">
            Selecciona el modelo, talla y color de la cama, cliente y flete a domicilio.
          </p>
        </div>

        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#C25E42] hover:bg-[#FAF0EC] rounded-lg border border-[#F3CEC2] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Vaciar Carrito</span>
          </button>
        )}
      </div>

      {/* 2-Column POS Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Customer & Dog Beds Catalog (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* STEP 1: Seleccionar o Registrar Dueño / Cliente */}
          <div className="bg-white p-5 rounded-xl border border-[#EADFD5] shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#F0EAE1] pb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#382417] flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#4A6B53] text-white flex items-center justify-center text-[10px]">
                  1
                </span>
                Cliente & Mascota
              </span>
              <button
                type="button"
                onClick={onOpenNewCustomerModal}
                className="flex items-center gap-1.5 text-xs font-bold text-[#4A6B53] hover:text-[#3B5742] bg-[#EAF1EB] hover:bg-[#D8E5D8] px-3 py-1 rounded-lg border border-[#C5DAC8] transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Registrar Cliente / Perrito</span>
              </button>
            </div>

            {selectedCustomer ? (
              <div className="p-3.5 bg-[#FAF7F2] border border-[#EADFD5] rounded-lg flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-[#382417] text-sm">{selectedCustomer.fullName}</p>
                    {selectedCustomer.petName && (
                      <span className="text-[11px] bg-[#EAF1EB] text-[#3B5742] px-2 py-0.5 rounded font-bold border border-[#C5DAC8]">
                        🐶 {selectedCustomer.petName}
                      </span>
                    )}
                  </div>
                  <p className="text-[#7A6150] mt-0.5">
                    Tel: <span className="font-mono">{selectedCustomer.phone}</span>
                    {selectedCustomer.email && ` · ${selectedCustomer.email}`}
                  </p>
                  {selectedCustomer.deliveryAddress && (
                    <p className="text-[#8C7565] text-[11px] mt-1">
                      Dir: {selectedCustomer.deliveryAddress}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="px-2.5 py-1 text-xs text-[#5C3D2E] bg-white border border-[#D9CABE] rounded hover:bg-[#F2ECE4] transition-colors font-semibold"
                >
                  Cambiar
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-[#A89689]" />
                  <input
                    type="text"
                    placeholder="Buscar cliente por nombre, teléfono o nombre del perrito..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-[#FAF7F2] border border-[#EADFD5] rounded-lg text-xs focus:bg-white focus:outline-none focus:border-[#4A6B53] text-[#382417]"
                  />
                </div>

                {filteredCustomers.length > 0 && (
                  <div className="border border-[#EADFD5] rounded-lg divide-y divide-[#F2ECE4] max-h-40 overflow-y-auto bg-white">
                    {filteredCustomers.map((cust) => (
                      <button
                        key={cust.id}
                        type="button"
                        onClick={() => {
                          handleSelectCustomer(cust);
                          setCustomerSearch('');
                        }}
                        className="w-full text-left p-2.5 hover:bg-[#FAF7F2] flex items-center justify-between text-xs transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-[#382417]">{cust.fullName}</p>
                            {cust.petName && (
                              <span className="text-[10px] text-[#4A6B53] font-semibold">
                                (🐶 {cust.petName})
                              </span>
                            )}
                          </div>
                          <p className="text-[#7A6150] text-[11px]">Tel: {cust.phone}</p>
                        </div>
                        <span className="text-[11px] text-[#4A6B53] font-bold">Seleccionar →</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* STEP 2: Catálogo de Camas para Perros con Selector de Variantes */}
          <div className="bg-white p-5 rounded-xl border border-[#EADFD5] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0EAE1] pb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#382417] flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#4A6B53] text-white flex items-center justify-center text-[10px]">
                  2
                </span>
                Camas y Variantes (Talla / Color)
              </span>

              {/* Bed Type filter buttons */}
              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => setTypeFilter('ALL')}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    typeFilter === 'ALL'
                      ? 'bg-[#382417] text-white font-bold'
                      : 'bg-[#FAF7F2] text-[#7A6150] hover:bg-[#F0EAE1]'
                  }`}
                >
                  Todas
                </button>
                <button
                  type="button"
                  onClick={() => setTypeFilter('Camas tipo dona')}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    typeFilter === 'Camas tipo dona'
                      ? 'bg-[#382417] text-white font-bold'
                      : 'bg-[#FAF7F2] text-[#7A6150] hover:bg-[#F0EAE1]'
                  }`}
                >
                  Donas
                </button>
                <button
                  type="button"
                  onClick={() => setTypeFilter('Camas ortopédicas')}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    typeFilter === 'Camas ortopédicas'
                      ? 'bg-[#382417] text-white font-bold'
                      : 'bg-[#FAF7F2] text-[#7A6150] hover:bg-[#F0EAE1]'
                  }`}
                >
                  Ortopédicas
                </button>
                <button
                  type="button"
                  onClick={() => setTypeFilter('Camas tipo cueva')}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    typeFilter === 'Camas tipo cueva'
                      ? 'bg-[#382417] text-white font-bold'
                      : 'bg-[#FAF7F2] text-[#7A6150] hover:bg-[#F0EAE1]'
                  }`}
                >
                  Cuevas
                </button>
                <button
                  type="button"
                  onClick={() => setTypeFilter('Camas elevadas')}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    typeFilter === 'Camas elevadas'
                      ? 'bg-[#382417] text-white font-bold'
                      : 'bg-[#FAF7F2] text-[#7A6150] hover:bg-[#F0EAE1]'
                  }`}
                >
                  Elevadas
                </button>
              </div>
            </div>

            {/* Catalog Search & Size filter */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2 relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-[#A89689]" />
                <input
                  type="text"
                  placeholder="Buscar modelo o raza recomendada..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#FAF7F2] border border-[#EADFD5] rounded-lg text-xs focus:bg-white focus:outline-none focus:border-[#4A6B53]"
                />
              </div>

              <div>
                <select
                  value={sizeFilter}
                  onChange={(e) => setSizeFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EADFD5] rounded-lg text-xs text-[#382417]"
                >
                  <option value="ALL">Todas las Tallas</option>
                  {settings.sizes.map((s) => (
                    <option key={s} value={s}>Talla {s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Products List with Variant Pickers */}
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {availableProducts.map((prod) => {
                const currentVariantId = selectedVariantByProduct[prod.id] || prod.variants?.[0]?.id;
                const activeVariant = currentVariantId
                  ? prod.variants.find((v) => v.id === currentVariantId)
                  : null;

                const priceToDisplay = activeVariant ? activeVariant.salePrice : prod.salePrice;
                const stockToDisplay = activeVariant ? activeVariant.stock : prod.stock;
                const isOutOfStock = stockToDisplay <= 0;

                return (
                  <div
                    key={prod.id}
                    className="p-3.5 rounded-xl border border-[#EADFD5] bg-[#FAF7F2]/50 hover:bg-white hover:border-[#4A6B53] transition-all flex flex-col sm:flex-row gap-3.5 items-start sm:items-center justify-between"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <img
                        src={prod.photoUrl || '/src/assets/images/dog_bed_donut_plush_1792871854634.jpg'}
                        alt={prod.name}
                        referrerPolicy="no-referrer"
                        className="w-16 h-14 object-cover rounded-lg bg-white border border-[#EADFD5] shrink-0"
                      />

                      <div className="min-w-0 flex-1 text-xs">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-[#382417] truncate leading-snug">{prod.name}</p>
                          <span className="text-[10px] text-[#7A6150] font-mono hidden sm:inline">
                            {activeVariant ? activeVariant.sku : prod.sku}
                          </span>
                        </div>

                        {prod.recommendedBreed && (
                          <p className="text-[10px] text-[#4A6B53] font-semibold truncate mt-0.5">
                            🐶 Para: {prod.recommendedBreed}
                          </p>
                        )}

                        {/* Variant selector dropdown or pills */}
                        {prod.variants && prod.variants.length > 1 && (
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[10px] font-semibold text-[#8C7565]">Variante:</span>
                            <select
                              value={currentVariantId}
                              onChange={(e) =>
                                setSelectedVariantByProduct({
                                  ...selectedVariantByProduct,
                                  [prod.id]: e.target.value
                                })
                              }
                              className="px-2 py-0.5 bg-white border border-[#D9CABE] rounded text-[11px] font-semibold text-[#382417]"
                            >
                              {prod.variants.map((v) => (
                                <option key={v.id} value={v.id}>
                                  Talla {v.size} · {v.color} (${v.salePrice.toLocaleString('es-MX')} | {v.stock} disp.)
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Price, Stock and Add Button */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#F0EAE1]">
                      <div className="text-left sm:text-right">
                        <p className="font-mono font-bold text-sm text-[#382417]">
                          ${priceToDisplay.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </p>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            isOutOfStock
                              ? 'bg-[#FAF0EC] text-[#C25E42]'
                              : stockToDisplay <= (activeVariant?.minStockAlert || prod.minStockAlert)
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-[#EAF1EB] text-[#3B5742]'
                          }`}
                        >
                          {isOutOfStock ? 'Agotada' : `${stockToDisplay} disponibles`}
                        </span>
                      </div>

                      <button
                        type="button"
                        disabled={isOutOfStock}
                        onClick={() => addToCart(prod)}
                        className={`px-3.5 py-2 rounded-lg text-xs font-bold shrink-0 transition-colors ${
                          isOutOfStock
                            ? 'bg-[#EADFD5] text-[#A89689] cursor-not-allowed'
                            : 'bg-[#4A6B53] hover:bg-[#3B5742] text-white shadow-xs'
                        }`}
                      >
                        + Agregar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Cart Summary & Checkout Process (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Cart Items Box with Dog Bed Thumbnails */}
          <div className="bg-white p-5 rounded-xl border border-[#EADFD5] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#F0EAE1] pb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#382417] flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#4A6B53] text-white flex items-center justify-center text-[10px]">
                  3
                </span>
                Carrito DogZzz ({cart.reduce((a, b) => a + b.quantity, 0)})
              </span>
              <span className="text-xs text-[#7A6150] font-mono">
                {cart.length} modelo(s)
              </span>
            </div>

            {cart.length === 0 ? (
              <div className="py-12 text-center text-[#A89689] space-y-2">
                <Dog className="w-10 h-10 mx-auto text-[#D4C9BC]" />
                <p className="text-xs font-bold text-[#5C3D2E]">El carrito está vacío</p>
                <p className="text-[11px] text-[#8C7565]">
                  Selecciona camas del catálogo izquierdo para armar el pedido de tu perrhijo.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#F2ECE4] max-h-72 overflow-y-auto pr-1">
                {cart.map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <img
                      src={item.product.photoUrl || '/src/assets/images/dog_bed_donut_plush_1792871854634.jpg'}
                      alt={item.product.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 object-cover rounded-md border border-[#EADFD5] shrink-0"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-[#382417] truncate leading-snug">
                        {item.product.name}
                      </p>
                      <p className="text-[10px] text-[#4A6B53] font-semibold">
                        Talla: <strong>{item.size}</strong> · {item.color}
                      </p>
                      <p className="text-[10px] text-[#7A6150] font-mono">
                        ${item.unitPrice.toLocaleString('es-MX')} c/u
                      </p>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => updateCartQty(item.product.id, item.variantId, item.quantity - 1)}
                        className="w-6 h-6 rounded bg-[#F0EAE1] hover:bg-[#E5DCD0] flex items-center justify-center text-[#382417]"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center font-bold font-mono text-[#382417]">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateCartQty(item.product.id, item.variantId, item.quantity + 1)}
                        className="w-6 h-6 rounded bg-[#F0EAE1] hover:bg-[#E5DCD0] flex items-center justify-center text-[#382417]"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right shrink-0 min-w-16">
                      <p className="font-mono font-bold text-[#382417]">
                        ${item.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.product.id, item.variantId)}
                      className="text-[#A89689] hover:text-[#C25E42] p-1"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Financial Totals Breakdown */}
            <div className="pt-3 border-t border-[#EADFD5] space-y-2 text-xs">
              <div className="flex justify-between text-[#7A6150]">
                <span>Subtotal de Camas:</span>
                <span className="font-mono tabular-nums">${rawSubtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-[#7A6150]">Descuento especial ($):</span>
                <input
                  type="number"
                  min="0"
                  max={rawSubtotal}
                  value={discount === 0 ? '' : discount}
                  placeholder="0.00"
                  onChange={(e) => setDiscount(Math.min(rawSubtotal, Math.max(0, parseFloat(e.target.value) || 0)))}
                  className="w-28 px-2 py-1 text-right border border-[#EADFD5] rounded font-mono text-xs focus:bg-white bg-[#FAF7F2]"
                />
              </div>

              <div className="flex justify-between text-[#7A6150]">
                <span>Flete / Envío canino:</span>
                <span className="font-mono tabular-nums">
                  {deliveryType === 'DELIVERY' ? `$${deliveryFee.toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : 'Gratis (Retiro en tienda)'}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm font-bold text-[#382417] pt-2 border-t border-[#EADFD5]">
                <span>TOTAL A PAGAR:</span>
                <span className="text-base font-mono tabular-nums text-[#382417]">
                  ${grandTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                </span>
              </div>
            </div>
          </div>

          {/* STEP 4 & 5: Delivery & Payment Options */}
          <div className="bg-white p-5 rounded-xl border border-[#EADFD5] shadow-xs space-y-4 text-xs">
            {/* Modalidad de Entrega */}
            <div>
              <span className="font-bold uppercase tracking-wider text-[#382417] block mb-2">
                4. Modalidad de Entrega
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDeliveryType('DELIVERY')}
                  className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all ${
                    deliveryType === 'DELIVERY'
                      ? 'border-[#4A6B53] bg-[#EAF1EB] text-[#3B5742] font-bold'
                      : 'border-[#EADFD5] text-[#7A6150] hover:bg-[#FAF7F2]'
                  }`}
                >
                  <Truck className="w-4 h-4 text-[#4A6B53] shrink-0" />
                  <div>
                    <p className="leading-none">A Domicilio</p>
                    <p className="text-[10px] text-[#7A6150] font-normal mt-0.5">+ Flete ${deliveryFee}</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryType('PICKUP')}
                  className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all ${
                    deliveryType === 'PICKUP'
                      ? 'border-[#4A6B53] bg-[#EAF1EB] text-[#3B5742] font-bold'
                      : 'border-[#EADFD5] text-[#7A6150] hover:bg-[#FAF7F2]'
                  }`}
                >
                  <Store className="w-4 h-4 text-[#4A6B53] shrink-0" />
                  <div>
                    <p className="leading-none">Retirar en DogZzz</p>
                    <p className="text-[10px] text-[#7A6150] font-normal mt-0.5">Sin costo de envío</p>
                  </div>
                </button>
              </div>

              {deliveryType === 'DELIVERY' && (
                <div className="mt-3 space-y-2 p-3 bg-[#FAF7F2] rounded-lg border border-[#EADFD5]">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[#7A6150] font-medium mb-1">Fecha de Entrega</label>
                      <input
                        type="date"
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        className="w-full px-2 py-1.5 border border-[#EADFD5] rounded bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[#7A6150] font-medium mb-1">Horario</label>
                      <select
                        value={deliveryTimeSlot}
                        onChange={(e) => setDeliveryTimeSlot(e.target.value)}
                        className="w-full px-2 py-1.5 border border-[#EADFD5] rounded bg-white text-xs"
                      >
                        <option value="10:00 - 14:00">10:00 - 14:00 (Matutino)</option>
                        <option value="14:00 - 18:00">14:00 - 18:00 (Vespertino)</option>
                        <option value="Todo el día">Horario Abierto / Por coordinar</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#7A6150] font-medium mb-1">Dirección Completa</label>
                    <input
                      type="text"
                      placeholder="Calle, número, colonia, código postal"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full px-2 py-1.5 border border-[#EADFD5] rounded bg-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[#7A6150] font-medium mb-1">Referencias de Domicilio</label>
                    <input
                      type="text"
                      placeholder="Color de casa, zaguán, entre calles..."
                      value={deliveryReferences}
                      onChange={(e) => setDeliveryReferences(e.target.value)}
                      className="w-full px-2 py-1.5 border border-[#EADFD5] rounded bg-white text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Payment Options */}
            <div>
              <span className="font-bold uppercase tracking-wider text-[#382417] block mb-2">
                5. Forma de Pago
              </span>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentType('FULL');
                    setPartialAmount(grandTotal);
                  }}
                  className={`py-2 px-3 rounded-lg border text-center font-bold transition-all ${
                    paymentType === 'FULL'
                      ? 'bg-[#382417] text-white border-[#382417]'
                      : 'bg-[#FAF7F2] text-[#7A6150] border-[#EADFD5] hover:bg-[#F0EAE1]'
                  }`}
                >
                  Liquidación Total (100%)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPaymentType('PARTIAL');
                    setPartialAmount(Math.round(grandTotal * 0.5));
                  }}
                  className={`py-2 px-3 rounded-lg border text-center font-bold transition-all ${
                    paymentType === 'PARTIAL'
                      ? 'bg-[#382417] text-white border-[#382417]'
                      : 'bg-[#FAF7F2] text-[#7A6150] border-[#EADFD5] hover:bg-[#F0EAE1]'
                  }`}
                >
                  Apartado / Anticipo
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#7A6150] font-medium mb-1">Método</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 border border-[#EADFD5] rounded-lg bg-[#FAF7F2] focus:bg-white text-xs font-bold text-[#382417]"
                  >
                    {settings.paymentMethods.map((pm) => (
                      <option key={pm} value={pm}>{pm}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#7A6150] font-medium mb-1">
                    {paymentType === 'FULL' ? 'Importe Cobrado' : 'Anticipo Recibido'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    disabled={paymentType === 'FULL'}
                    value={paymentType === 'FULL' ? grandTotal : (partialAmount || '')}
                    onChange={(e) => setPartialAmount(Math.min(grandTotal, parseFloat(e.target.value) || 0))}
                    className="w-full px-2.5 py-1.5 border border-[#EADFD5] rounded-lg bg-[#FAF7F2] focus:bg-white font-mono font-bold text-xs text-[#382417]"
                  />
                </div>
              </div>

              {/* Cash Change Calculator */}
              {paymentMethod === 'Efectivo' && (
                <div className="mt-3 p-3 bg-[#FAF7F2] rounded-lg border border-[#EADFD5] grid grid-cols-2 gap-3 items-center">
                  <div>
                    <label className="block text-[#7A6150] font-medium mb-1">Cliente Paga Con ($):</label>
                    <input
                      type="number"
                      placeholder="Ej. 2000"
                      value={cashGiven || ''}
                      onChange={(e) => setCashGiven(parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 border border-[#EADFD5] rounded bg-white font-mono font-bold text-xs"
                    />
                  </div>
                  <div>
                    <span className="block text-[#7A6150] text-[11px]">Cambio a devolver:</span>
                    <span className="font-mono font-bold text-sm text-[#4A6B53]">
                      ${changeToGive.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                    </span>
                  </div>
                </div>
              )}

              {remainingBalance > 0 && (
                <div className="mt-2.5 p-2.5 bg-[#FAF0EC] rounded-lg border border-[#F3CEC2] flex items-center justify-between text-xs text-[#C25E42] font-bold">
                  <span>Saldo a liquidar contra entrega:</span>
                  <span className="font-mono">
                    ${remainingBalance.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Sale Button */}
            <div className="pt-2">
              <button
                type="button"
                disabled={cart.length === 0 || !selectedCustomer}
                onClick={() => setShowConfirmModal(true)}
                className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all ${
                  cart.length === 0 || !selectedCustomer
                    ? 'bg-[#EADFD5] text-[#A89689] cursor-not-allowed'
                    : 'bg-[#C25E42] hover:bg-[#B04D32] text-white'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                <span>Confirmar y Procesar Venta DogZzz</span>
              </button>
              {!selectedCustomer && (
                <p className="text-[10px] text-center text-[#8C7565] mt-1">
                  * Selecciona o registra al cliente antes de continuar
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-[#EADFD5] p-6 space-y-4">
            <h3 className="font-bold text-[#382417] text-base">Confirmar Venta en DogZzz</h3>
            <p className="text-xs text-[#5C3D2E] leading-relaxed">
              ¿Deseas finalizar la venta para <strong>{selectedCustomer?.fullName}</strong> {selectedCustomer?.petName ? `(🐶 ${selectedCustomer.petName})` : ''}? Se descontará el inventario de las variantes seleccionadas.
            </p>

            <div className="p-3 bg-[#FAF7F2] rounded-lg border border-[#EADFD5] space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#7A6150]">Camas a despachar:</span>
                <span className="font-bold text-[#382417]">{cart.reduce((a, b) => a + b.quantity, 0)} pieza(s)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7A6150]">Total a pagar:</span>
                <span className="font-mono font-bold text-[#382417]">${grandTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7A6150]">Cobro registrado hoy:</span>
                <span className="font-mono font-bold text-[#4A6B53]">${amountToPayNow.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
              </div>
              {remainingBalance > 0 && (
                <div className="flex justify-between text-[#C25E42]">
                  <span>Saldo pendiente:</span>
                  <span className="font-mono font-bold">${remainingBalance.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 border border-[#EADFD5] rounded-lg text-[#5C3D2E] hover:bg-[#FAF7F2] text-xs font-medium"
              >
                Volver a revisar
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinalizeSale}
                className="px-5 py-2 bg-[#C25E42] text-white rounded-lg text-xs font-bold hover:bg-[#B04D32] shadow-xs"
              >
                {isSubmitting ? 'Guardando...' : 'Sí, Procesar Venta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
