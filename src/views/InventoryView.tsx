import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product, ProductVariant, DogBedSize, DogBedType } from '../types';
import {
  Dog,
  Search,
  Plus,
  History,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  PackagePlus,
  LayoutGrid,
  Table as TableIcon,
  X,
  Star,
  Info,
  Sparkles,
  Layers
} from 'lucide-react';

interface InventoryViewProps {
  onOpenNewProductModal: () => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ onOpenNewProductModal }) => {
  const {
    products,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
    toggleFeaturedProduct,
    adjustInventoryStock,
    movements,
    settings,
    isAdmin
  } = useApp();

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedSize, setSelectedSize] = useState<string>('ALL');
  const [selectedAvailability, setSelectedAvailability] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'INACTIVE'>('ALL');
  const [sortField, setSortField] = useState<'name' | 'salePrice' | 'stock'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid'); // Default to beautiful visual catalog

  // Modals
  const [selectedProductDetails, setSelectedProductDetails] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [adjustQty, setAdjustQty] = useState<number>(1);
  const [adjustType, setAdjustType] = useState<'IN_PURCHASE' | 'IN_ADJUST' | 'OUT_ADJUST'>('IN_PURCHASE');
  const [adjustReason, setAdjustReason] = useState<string>('');
  const [showMovementsModal, setShowMovementsModal] = useState(false);

  // Filtered & Sorted products
  const filteredProducts = products.filter((prod) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      prod.name.toLowerCase().includes(term) ||
      prod.sku.toLowerCase().includes(term) ||
      prod.outerMaterial.toLowerCase().includes(term) ||
      prod.bedType.toLowerCase().includes(term) ||
      (prod.recommendedBreed && prod.recommendedBreed.toLowerCase().includes(term)) ||
      (prod.color && prod.color.toLowerCase().includes(term));

    if (!matchesSearch) return false;

    if (selectedType !== 'ALL' && prod.bedType !== selectedType) return false;

    if (selectedSize !== 'ALL') {
      const hasSize = prod.size === selectedSize || (prod.variants && prod.variants.some((v) => v.size === selectedSize));
      if (!hasSize) return false;
    }

    if (selectedAvailability === 'IN_STOCK') return prod.isActive && prod.stock > prod.minStockAlert;
    if (selectedAvailability === 'LOW_STOCK') return prod.isActive && prod.stock > 0 && prod.stock <= prod.minStockAlert;
    if (selectedAvailability === 'OUT_OF_STOCK') return prod.isActive && prod.stock === 0;
    if (selectedAvailability === 'INACTIVE') return !prod.isActive;

    return true;
  }).sort((a, b) => {
    let comp = 0;
    if (sortField === 'name') comp = a.name.localeCompare(b.name);
    if (sortField === 'salePrice') comp = a.salePrice - b.salePrice;
    if (sortField === 'stock') comp = a.stock - b.stock;
    return sortOrder === 'asc' ? comp : -comp;
  });

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingProduct) return;
    if (!adjustReason.trim()) {
      alert('Por favor indica el motivo del ajuste en el inventario.');
      return;
    }

    const qty = adjustType === 'OUT_ADJUST' ? -Math.abs(adjustQty) : Math.abs(adjustQty);
    adjustInventoryStock(
      adjustingProduct.id,
      selectedVariantId || undefined,
      qty,
      adjustReason,
      adjustType
    );
    setAdjustingProduct(null);
    setAdjustReason('');
    setAdjustQty(1);
    setSelectedVariantId('');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    updateProduct(editingProduct.id, editingProduct);
    setEditingProduct(null);
  };

  return (
    <div className="space-y-5">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-[#EADFD5] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Dog className="w-5 h-5 text-[#4A6B53]" />
            <h1 className="text-xl font-bold text-[#382417] tracking-tight">
              Catálogo e Inventario de Camas para Perros
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#FAF7F2] text-[#5C3D2E] border border-[#EADFD5]">
              {products.length} modelos en DogZzz
            </span>
          </div>
          <p className="text-xs text-[#7A6150] mt-1">
            Administra existencias por variante de talla y color, recomendaciones por raza, materiales y movimientos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMovementsModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-[#382417] bg-[#F0EAE1] hover:bg-[#E5DCD0] rounded-lg transition-colors border border-[#D9CABE]"
          >
            <History className="w-4 h-4 text-[#7A6150]" />
            <span>Movimientos de Almacén</span>
          </button>

          <button
            onClick={onOpenNewProductModal}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#C25E42] hover:bg-[#B04D32] rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Cama para Perros</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#EADFD5] shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-[#A89689]" />
            <input
              type="text"
              placeholder="Buscar cama por modelo, SKU, material, color o raza recomendada..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#FAF7F2] border border-[#EADFD5] rounded-lg text-xs focus:outline-none focus:border-[#4A6B53] focus:bg-white text-[#382417] transition-colors"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EADFD5] rounded-lg text-xs focus:outline-none focus:border-[#4A6B53] text-[#382417]"
            >
              <option value="ALL">Todos los Tipos de Cama</option>
              {settings.categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Size Filter */}
          <div>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EADFD5] rounded-lg text-xs focus:outline-none focus:border-[#4A6B53] text-[#382417]"
            >
              <option value="ALL">Todas las Tallas (XS a XXL)</option>
              {settings.sizes.map((sz) => (
                <option key={sz} value={sz}>Talla {sz}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Secondary controls row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#F0EAE1] text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[#7A6150]">Disponibilidad:</span>
            <div className="flex gap-1">
              <button
                onClick={() => setSelectedAvailability('ALL')}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  selectedAvailability === 'ALL'
                    ? 'bg-[#382417] text-white font-bold'
                    : 'bg-[#FAF7F2] text-[#7A6150] border border-[#EADFD5] hover:bg-[#F0EAE1]'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setSelectedAvailability('IN_STOCK')}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  selectedAvailability === 'IN_STOCK'
                    ? 'bg-[#4A6B53] text-white font-bold'
                    : 'bg-[#FAF7F2] text-[#7A6150] border border-[#EADFD5] hover:bg-[#F0EAE1]'
                }`}
              >
                En Existencia
              </button>
              <button
                onClick={() => setSelectedAvailability('LOW_STOCK')}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  selectedAvailability === 'LOW_STOCK'
                    ? 'bg-[#C25E42] text-white font-bold'
                    : 'bg-[#FAF7F2] text-[#7A6150] border border-[#EADFD5] hover:bg-[#F0EAE1]'
                }`}
              >
                Stock Bajo
              </button>
              <button
                onClick={() => setSelectedAvailability('OUT_OF_STOCK')}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  selectedAvailability === 'OUT_OF_STOCK'
                    ? 'bg-[#8C341C] text-white font-bold'
                    : 'bg-[#FAF7F2] text-[#7A6150] border border-[#EADFD5] hover:bg-[#F0EAE1]'
                }`}
              >
                Agotados
              </button>
            </div>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-2">
            <span className="text-[#7A6150]">Vista:</span>
            <div className="flex items-center gap-1 p-0.5 bg-[#FAF7F2] rounded-lg border border-[#EADFD5]">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  viewMode === 'grid' ? 'bg-white shadow-xs text-[#382417]' : 'text-[#7A6150] hover:text-[#382417]'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Catálogo Visual</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  viewMode === 'table' ? 'bg-white shadow-xs text-[#382417]' : 'text-[#7A6150] hover:text-[#382417]'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Tabla Detallada</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Rendering: Visual Grid or Table */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-[#EADFD5] text-center space-y-3">
          <Dog className="w-12 h-12 text-[#D4C9BC] mx-auto" />
          <h3 className="text-base font-bold text-[#382417]">No se encontraron camas para perros</h3>
          <p className="text-xs text-[#7A6150] max-w-md mx-auto">
            Ningún modelo coincide con los filtros o la búsqueda ingresada. Intenta seleccionar otra categoría o talla.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedType('ALL');
              setSelectedSize('ALL');
              setSelectedAvailability('ALL');
            }}
            className="px-4 py-2 text-xs font-bold text-[#382417] bg-[#F0EAE1] hover:bg-[#E5DCD0] rounded-lg transition-colors"
          >
            Limpiar filtros
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* VISUAL CATALOG CARDS (ENHANCED AS REQUESTED) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredProducts.map((prod) => {
            const isLow = prod.stock > 0 && prod.stock <= prod.minStockAlert;
            const isOut = prod.stock === 0;

            return (
              <div
                key={prod.id}
                className="bg-white rounded-xl border border-[#EADFD5] overflow-hidden shadow-xs hover:border-[#4A6B53] transition-all flex flex-col justify-between group"
              >
                {/* Photo & Badges */}
                <div className="relative aspect-4/3 bg-[#FAF7F2] overflow-hidden">
                  <img
                    src={prod.photoUrl || '/src/assets/images/dog_bed_donut_plush_1792871854634.jpg'}
                    alt={prod.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                  />

                  {/* Bed Type Badge */}
                  <span className="absolute top-2.5 left-2.5 text-[10px] font-bold px-2.5 py-0.5 rounded bg-white/90 text-[#382417] shadow-xs backdrop-blur-xs">
                    {prod.bedType}
                  </span>

                  {/* Stock Badge */}
                  <span
                    className={`absolute top-2.5 right-2.5 text-[10px] font-bold px-2 py-0.5 rounded shadow-xs ${
                      isOut
                        ? 'bg-[#C25E42] text-white'
                        : isLow
                        ? 'bg-[#D97706] text-white'
                        : 'bg-[#4A6B53] text-white'
                    }`}
                  >
                    {isOut ? 'AGOTADO' : isLow ? `POCO STOCK (${prod.stock})` : `${prod.stock} DISP.`}
                  </span>

                  {/* Star Favorite / Featured Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFeaturedProduct(prod.id);
                    }}
                    className={`absolute bottom-2.5 right-2.5 p-1.5 rounded-full shadow-xs transition-colors ${
                      prod.isFeatured ? 'bg-amber-400 text-amber-950' : 'bg-white/80 text-stone-400 hover:text-amber-500'
                    }`}
                    title={prod.isFeatured ? 'Quitar de destacados' : 'Marcar como cama destacada'}
                  >
                    <Star className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-[#8C7565]">
                      <span className="font-mono">{prod.sku}</span>
                      <span>Color: <strong>{prod.color}</strong></span>
                    </div>

                    <h3 className="font-bold text-[#382417] text-xs mt-1 leading-snug line-clamp-1">
                      {prod.name}
                    </h3>

                    {/* Recommended Breed */}
                    {prod.recommendedBreed && (
                      <p className="text-[11px] text-[#4A6B53] font-semibold mt-1 line-clamp-1">
                        🐶 {prod.recommendedBreed}
                      </p>
                    )}

                    <p className="text-[11px] text-[#7A6150] mt-1 line-clamp-2 leading-relaxed">
                      {prod.description}
                    </p>

                    {/* Variants Preview Pills */}
                    {prod.variants && prod.variants.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-[#F0EAE1]">
                        <span className="text-[10px] font-semibold text-[#8C7565] block mb-1">
                          Tallas disponibles:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {prod.variants.map((v) => (
                            <span
                              key={v.id}
                              className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                                v.stock === 0
                                  ? 'bg-rose-50 text-rose-700 border-rose-200 line-through'
                                  : 'bg-[#FAF7F2] text-[#382417] border-[#EADFD5]'
                              }`}
                              title={`${v.size} (${v.color}) - Stock: ${v.stock} disp.`}
                            >
                              {v.size}: {v.stock}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom: Price and Operational Buttons */}
                  <div className="pt-3 border-t border-[#F0EAE1] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#8C7565]">Precio Venta:</span>
                      <p className="text-sm font-bold font-mono text-[#382417]">
                        ${prod.salePrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSelectedProductDetails(prod)}
                        className="p-1.5 text-[#5C3D2E] hover:text-[#382417] hover:bg-[#F0EAE1] rounded-lg transition-colors"
                        title="Ver ficha técnica completa y variantes"
                      >
                        <Info className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          setAdjustingProduct(prod);
                          setSelectedVariantId(prod.variants?.[0]?.id || '');
                          setAdjustType('IN_PURCHASE');
                          setAdjustQty(1);
                          setAdjustReason('Entrada de mercancía / Lote DogZzz');
                        }}
                        className="p-1.5 text-[#4A6B53] hover:text-[#3B5742] hover:bg-[#EAF1EB] rounded-lg transition-colors"
                        title="Ajustar existencias / Entrada"
                      >
                        <PackagePlus className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setEditingProduct(prod)}
                        className="p-1.5 text-[#7A6150] hover:text-[#382417] hover:bg-[#F0EAE1] rounded-lg transition-colors"
                        title="Editar modelo"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => deleteProduct(prod.id)}
                        className="p-1.5 text-[#7A6150] hover:text-[#C25E42] hover:bg-[#FAF0EC] rounded-lg transition-colors"
                        title="Eliminar o archivar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-xl border border-[#EADFD5] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#FAF7F2] border-b border-[#EADFD5] text-[#5C3D2E] uppercase font-semibold">
                  <th className="py-3 px-4">Modelo y SKU</th>
                  <th className="py-3 px-4">Tipo de Cama</th>
                  <th className="py-3 px-4">Raza Recomendada / Talla</th>
                  <th className="py-3 px-4 text-right">Costo</th>
                  <th className="py-3 px-4 text-right">P. Venta</th>
                  <th className="py-3 px-4 text-center">Stock Total</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2ECE4]">
                {filteredProducts.map((prod) => {
                  const isLow = prod.stock > 0 && prod.stock <= prod.minStockAlert;
                  const isOut = prod.stock === 0;

                  return (
                    <tr
                      key={prod.id}
                      className={`hover:bg-[#FAF7F2] transition-colors ${
                        !prod.isActive ? 'opacity-60 bg-[#FAF7F2]/40' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.photoUrl || '/src/assets/images/dog_bed_donut_plush_1792871854634.jpg'}
                            alt={prod.name}
                            referrerPolicy="no-referrer"
                            className="w-12 h-10 object-cover rounded-md bg-[#FAF7F2] border border-[#EADFD5] shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-[#382417] leading-snug">{prod.name}</p>
                            <p className="text-[11px] font-mono text-[#8C7565] mt-0.5">
                              {prod.sku} · {prod.color}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-[#5C3D2E] whitespace-nowrap">
                        {prod.bedType}
                      </td>

                      <td className="py-3.5 px-4 text-[#7A6150]">
                        <p className="font-medium text-[#382417]">Talla {prod.size}</p>
                        <p className="text-[10px] text-[#4A6B53] truncate max-w-xs">{prod.recommendedBreed || 'Universal'}</p>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono tabular-nums text-[#7A6150] whitespace-nowrap">
                        ${prod.costPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-bold tabular-nums text-[#382417] whitespace-nowrap">
                        ${prod.salePrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span
                            className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                              isOut
                                ? 'bg-[#FAF0EC] text-[#C25E42]'
                                : isLow
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-[#EAF1EB] text-[#3B5742]'
                            }`}
                          >
                            {prod.stock} disp.
                          </span>
                          <span className="text-[10px] text-[#8C7565] mt-0.5">
                            Mín: {prod.minStockAlert}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {prod.isActive ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-[#4A6B53] font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#4A6B53]" />
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-[#A89689] font-medium">
                            <XCircle className="w-3.5 h-3.5" />
                            Inactivo
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedProductDetails(prod)}
                            className="p-1.5 text-[#5C3D2E] hover:text-[#382417] hover:bg-[#F0EAE1] rounded transition-colors"
                            title="Ver detalles"
                          >
                            <Info className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setAdjustingProduct(prod);
                              setSelectedVariantId(prod.variants?.[0]?.id || '');
                              setAdjustType('IN_PURCHASE');
                              setAdjustQty(1);
                              setAdjustReason('Entrada de mercancía DogZzz');
                            }}
                            className="p-1.5 text-[#4A6B53] hover:text-[#3B5742] hover:bg-[#EAF1EB] rounded transition-colors"
                            title="Ajustar stock"
                          >
                            <PackagePlus className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setEditingProduct(prod)}
                            className="p-1.5 text-[#7A6150] hover:text-[#382417] hover:bg-[#F0EAE1] rounded transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => deleteProduct(prod.id)}
                            className="p-1.5 text-[#7A6150] hover:text-[#C25E42] hover:bg-[#FAF0EC] rounded transition-colors"
                            title="Eliminar o archivar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Ficha Técnica Completa y Variantes */}
      {selectedProductDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-[#EADFD5] p-6 space-y-5 my-6">
            <div className="flex items-start justify-between pb-3 border-b border-[#EADFD5]">
              <div className="flex items-center gap-3">
                <img
                  src={selectedProductDetails.photoUrl || '/src/assets/images/dog_bed_donut_plush_1792871854634.jpg'}
                  alt={selectedProductDetails.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-14 object-cover rounded-lg border border-[#EADFD5]"
                />
                <div>
                  <h3 className="font-bold text-[#382417] text-base">{selectedProductDetails.name}</h3>
                  <p className="text-xs text-[#7A6150]">
                    {selectedProductDetails.bedType} · SKU Base: {selectedProductDetails.sku}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedProductDetails(null)} className="text-[#A89689] hover:text-[#382417] p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-[#FAF7F2] rounded-lg border border-[#EADFD5]">
                <div>
                  <span className="text-[#8C7565] font-semibold">Raza Recomendada:</span>
                  <p className="font-bold text-[#4A6B53] mt-0.5">🐶 {selectedProductDetails.recommendedBreed || 'Todas las razas'}</p>
                </div>
                <div>
                  <span className="text-[#8C7565] font-semibold">Material Exterior:</span>
                  <p className="font-medium text-[#382417] mt-0.5">{selectedProductDetails.outerMaterial}</p>
                </div>
                <div>
                  <span className="text-[#8C7565] font-semibold">Material de Relleno:</span>
                  <p className="font-medium text-[#382417] mt-0.5">{selectedProductDetails.fillingMaterial}</p>
                </div>
                <div>
                  <span className="text-[#8C7565] font-semibold">Ubicación en Almacén:</span>
                  <p className="font-medium text-[#382417] mt-0.5">{selectedProductDetails.warehouseLocation || 'General'}</p>
                </div>
              </div>

              {selectedProductDetails.specialFeatures && (
                <div>
                  <span className="text-[#8C7565] font-semibold block mb-1">Características Especiales:</span>
                  <p className="text-[#5C3D2E] bg-[#FAF7F2] p-2.5 rounded border border-[#EADFD5]">
                    ✨ {selectedProductDetails.specialFeatures}
                  </p>
                </div>
              )}

              {/* Variants Breakdown */}
              <div>
                <h4 className="font-bold text-[#382417] uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#4A6B53]" />
                  Variantes Registradas de este Modelo ({selectedProductDetails.variants?.length || 0})
                </h4>

                <table className="w-full text-left text-xs border border-[#EADFD5] rounded-lg overflow-hidden">
                  <thead className="bg-[#FAF7F2] text-[#5C3D2E] border-b border-[#EADFD5] font-semibold">
                    <tr>
                      <th className="p-2.5">SKU Variante</th>
                      <th className="p-2.5 text-center">Talla</th>
                      <th className="p-2.5">Color</th>
                      <th className="p-2.5">Dimensiones</th>
                      <th className="p-2.5 text-right">P. Venta</th>
                      <th className="p-2.5 text-center">Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F2ECE4]">
                    {selectedProductDetails.variants?.map((v) => (
                      <tr key={v.id}>
                        <td className="p-2.5 font-mono text-[11px]">{v.sku}</td>
                        <td className="p-2.5 text-center font-bold text-[#382417]">{v.size}</td>
                        <td className="p-2.5 text-[#7A6150]">{v.color}</td>
                        <td className="p-2.5 text-[#7A6150]">{v.dimensions}</td>
                        <td className="p-2.5 text-right font-mono font-bold text-[#382417]">
                          ${v.salePrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-2.5 text-center font-mono font-bold">
                          <span className={v.stock === 0 ? 'text-[#C25E42]' : 'text-[#4A6B53]'}>
                            {v.stock}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#EADFD5]">
              <button
                type="button"
                onClick={() => setSelectedProductDetails(null)}
                className="px-4 py-2 bg-[#382417] text-white rounded-lg text-xs font-bold hover:bg-[#2C1810]"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Ajustar Stock / Entrada de Mercancía */}
      {adjustingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-[#EADFD5] p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EADFD5]">
              <div>
                <h3 className="font-bold text-[#382417] text-sm">Ajuste de Existencias DogZzz</h3>
                <p className="text-xs text-[#7A6150] truncate">{adjustingProduct.name}</p>
              </div>
              <button
                onClick={() => setAdjustingProduct(null)}
                className="text-[#A89689] hover:text-[#382417] p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs">
              {/* Variant Selector */}
              {adjustingProduct.variants && adjustingProduct.variants.length > 0 && (
                <div>
                  <label className="block text-[#382417] font-semibold mb-1">
                    Seleccionar Variante a Ajustar
                  </label>
                  <select
                    value={selectedVariantId}
                    onChange={(e) => setSelectedVariantId(e.target.value)}
                    className="w-full px-3 py-2 border border-[#EADFD5] rounded-lg bg-[#FAF7F2] text-xs font-semibold text-[#382417]"
                  >
                    {adjustingProduct.variants.map((v) => (
                      <option key={v.id} value={v.id}>
                        Talla {v.size} ({v.color}) — Stock actual: {v.stock}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-[#382417] font-semibold mb-1">Tipo de Movimiento</label>
                <select
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-[#EADFD5] rounded-lg bg-[#FAF7F2] text-xs text-[#382417]"
                >
                  <option value="IN_PURCHASE">Entrada de Mercancía (Lote de Fábrica)</option>
                  <option value="IN_ADJUST">Ajuste Positivo (Sobrante de Conteo)</option>
                  <option value="OUT_ADJUST">Ajuste Negativo (Merma / Daño en Tienda / Muestra)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#382417] font-semibold mb-1">
                  Cantidad a {adjustType === 'OUT_ADJUST' ? 'Descontar' : 'Sumar'}
                </label>
                <input
                  type="number"
                  min="1"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 border border-[#EADFD5] rounded-lg bg-[#FAF7F2] font-mono font-bold text-sm text-[#382417]"
                  required
                />
              </div>

              <div>
                <label className="block text-[#382417] font-semibold mb-1">
                  Motivo obligatorio del movimiento
                </label>
                <textarea
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="Ej. Recepción de lote de fábrica DogZzz #504, o reposición por defecto..."
                  rows={3}
                  className="w-full px-3 py-2 border border-[#EADFD5] rounded-lg bg-[#FAF7F2] text-xs"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustingProduct(null)}
                  className="px-4 py-2 border border-[#EADFD5] rounded-lg text-[#5C3D2E] hover:bg-[#FAF7F2]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#4A6B53] text-white rounded-lg font-bold hover:bg-[#3B5742]"
                >
                  Guardar Movimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Editar Cama para Perros */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-xl w-full border border-[#EADFD5] p-6 space-y-4 my-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#EADFD5]">
              <h3 className="font-bold text-[#382417] text-base">Editar Cama para Perro</h3>
              <button onClick={() => setEditingProduct(null)} className="text-[#A89689] hover:text-[#382417] p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#382417] font-semibold mb-1">Código SKU</label>
                  <input
                    type="text"
                    value={editingProduct.sku}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    className="w-full px-3 py-2 border border-[#EADFD5] rounded-lg font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#382417] font-semibold mb-1">Nombre Comercial</label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full px-3 py-2 border border-[#EADFD5] rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#382417] font-semibold mb-1">Tipo de Cama</label>
                  <select
                    value={editingProduct.bedType}
                    onChange={(e) => setEditingProduct({ ...editingProduct, bedType: e.target.value, category: e.target.value })}
                    className="w-full px-3 py-2 border border-[#EADFD5] rounded-lg bg-white"
                  >
                    {settings.categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#382417] font-semibold mb-1">Talla Base</label>
                  <select
                    value={editingProduct.size}
                    onChange={(e) => setEditingProduct({ ...editingProduct, size: e.target.value })}
                    className="w-full px-3 py-2 border border-[#EADFD5] rounded-lg bg-white font-bold"
                  >
                    {settings.sizes.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#382417] font-semibold mb-1">Color</label>
                  <input
                    type="text"
                    value={editingProduct.color}
                    onChange={(e) => setEditingProduct({ ...editingProduct, color: e.target.value })}
                    className="w-full px-3 py-2 border border-[#EADFD5] rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#382417] font-semibold mb-1">Raza o Tamaño de Perro Recomendado</label>
                <input
                  type="text"
                  placeholder="Ej. Chihuahua, Beagle, Golden Retriever, etc."
                  value={editingProduct.recommendedBreed || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, recommendedBreed: e.target.value })}
                  className="w-full px-3 py-2 border border-[#EADFD5] rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#382417] font-semibold mb-1">Precio Costo ($ MXN)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct.costPrice}
                    onChange={(e) => setEditingProduct({ ...editingProduct, costPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-[#EADFD5] rounded-lg font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#382417] font-semibold mb-1">Precio Venta ($ MXN)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct.salePrice}
                    onChange={(e) => setEditingProduct({ ...editingProduct, salePrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-[#EADFD5] rounded-lg font-mono font-bold text-[#382417]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#382417] font-semibold mb-1">Descripción</label>
                <textarea
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-[#EADFD5] rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#EADFD5]">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 border border-[#EADFD5] rounded-lg text-[#5C3D2E] hover:bg-[#FAF7F2]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#4A6B53] text-white rounded-lg font-bold hover:bg-[#3B5742]"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Movements History Drawer / Modal */}
      {showMovementsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full border border-[#EADFD5] p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#EADFD5]">
              <div>
                <h3 className="font-bold text-[#382417] text-base">Historial de Movimientos de Almacén DogZzz</h3>
                <p className="text-xs text-[#7A6150]">Trazabilidad de entradas, salidas por ventas y devoluciones</p>
              </div>
              <button onClick={() => setShowMovementsModal(false)} className="text-[#A89689] hover:text-[#382417] p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#FAF7F2] border-b border-[#EADFD5] text-[#5C3D2E] uppercase font-semibold sticky top-0">
                    <th className="py-2.5 px-3">Fecha</th>
                    <th className="py-2.5 px-3">Cama / Variante</th>
                    <th className="py-2.5 px-3">Tipo</th>
                    <th className="py-2.5 px-3 text-center">Cantidad</th>
                    <th className="py-2.5 px-3 text-center">Stock Post</th>
                    <th className="py-2.5 px-3">Motivo</th>
                    <th className="py-2.5 px-3">Responsable</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2ECE4]">
                  {movements.map((mov) => {
                    const isPositive = mov.quantity > 0;
                    return (
                      <tr key={mov.id} className="hover:bg-[#FAF7F2]">
                        <td className="py-2.5 px-3 text-[#7A6150] whitespace-nowrap">
                          {new Date(mov.createdAt).toLocaleDateString('es-MX', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-[#382417]">
                          {mov.productName}
                          {mov.variantInfo && (
                            <span className="block text-[10px] text-[#4A6B53] font-normal">
                              {mov.variantInfo}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-[#5C3D2E] whitespace-nowrap">
                          {mov.type === 'OUT_SALE' && 'Salida por Venta'}
                          {mov.type === 'IN_PURCHASE' && 'Entrada de Lote'}
                          {mov.type === 'IN_ADJUST' && 'Ajuste (+)'}
                          {mov.type === 'OUT_ADJUST' && 'Ajuste (-)'}
                          {mov.type === 'RETURN_CANCEL' && 'Devolución'}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold">
                          <span className={isPositive ? 'text-[#4A6B53]' : 'text-[#382417]'}>
                            {isPositive ? `+${mov.quantity}` : mov.quantity}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-[#7A6150]">
                          {mov.newStock}
                        </td>
                        <td className="py-2.5 px-3 text-[#5C3D2E] max-w-xs truncate">
                          {mov.reason}
                        </td>
                        <td className="py-2.5 px-3 text-[#7A6150] whitespace-nowrap">
                          {mov.registeredBy}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#EADFD5]">
              <button
                onClick={() => setShowMovementsModal(false)}
                className="px-4 py-2 bg-[#382417] text-white rounded-lg text-xs font-bold hover:bg-[#2C1810]"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
