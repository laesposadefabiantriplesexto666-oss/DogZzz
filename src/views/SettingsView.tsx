import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Settings,
  Store,
  Sliders,
  Database,
  Cloud,
  Download,
  Upload,
  RefreshCw,
  Plus,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Server,
  Key,
  ShieldAlert,
  Terminal,
  BookOpen,
  Dog,
  Heart
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    resetToDemoData,
    clearToProductionMode,
    exportDatabaseJSON,
    importDatabaseJSON,
    isAdmin
  } = useApp();

  const [activeTab, setActiveTab] = useState<'business' | 'catalog' | 'data' | 'cloud'>('business');

  // Business Form State
  const [businessName, setBusinessName] = useState(settings.businessName);
  const [slogan, setSlogan] = useState(settings.slogan || 'El descanso que mueve sus colitas');
  const [phone, setPhone] = useState(settings.phone);
  const [address, setAddress] = useState(settings.address);
  const [city, setCity] = useState(settings.city);
  const [operatingHours, setOperatingHours] = useState(settings.operatingHours);
  const [currency, setCurrency] = useState(settings.currency);
  const [defaultDeliveryFee, setDefaultDeliveryFee] = useState(settings.defaultDeliveryFee);
  const [defaultMinStock, setDefaultMinStock] = useState(settings.defaultMinStock);

  // Dynamic Catalog Lists
  const [categories, setCategories] = useState<string[]>(settings.categories);
  const [sizes, setSizes] = useState<string[]>(settings.sizes);
  const [materials, setMaterials] = useState<string[]>(settings.materials);
  const [styles, setStyles] = useState<string[]>(settings.styles || ['Nórdico', 'Moderno', 'Bicolor', 'Estampado']);

  // Temporary list input fields
  const [newCategory, setNewCategory] = useState('');
  const [newSize, setNewSize] = useState('');
  const [newMaterial, setNewMaterial] = useState('');
  const [newStyle, setNewStyle] = useState('');

  // Import JSON file input reference
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleSaveBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      businessName: businessName.trim() || 'DogZzz',
      slogan: slogan.trim(),
      phone,
      address,
      city,
      operatingHours,
      currency,
      defaultDeliveryFee: Number(defaultDeliveryFee) || 0,
      defaultMinStock: Number(defaultMinStock) || 2
    });
  };

  const handleSaveCatalog = () => {
    updateSettings({
      categories,
      sizes,
      materials,
      styles
    });
  };

  const handleExportJSON = () => {
    const jsonStr = exportDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `respaldo_dogzzz_camas_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importDatabaseJSON(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 text-[#2C1810]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFDF9] p-5 rounded-2xl border border-[#E8DFD5] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#4A6B53]/15 text-[#4A6B53] flex items-center justify-center">
              <Settings className="w-4.5 h-4.5" />
            </div>
            <h1 className="text-xl font-bold text-[#2C1810] tracking-tight">
              Configuración y Datos de DogZzz
            </h1>
          </div>
          <p className="text-xs text-[#6B5A4E] mt-1">
            Personaliza el nombre de la tienda, eslogan, tallas caninas, respaldos completos y arquitectura técnica.
          </p>
        </div>

        {/* Tab selection */}
        <div className="flex items-center gap-1 p-1 bg-[#FAF7F2] rounded-xl border border-[#E8DFD5] text-xs">
          <button
            onClick={() => setActiveTab('business')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              activeTab === 'business' ? 'bg-white text-[#2C1810] shadow-xs' : 'text-[#8C7A6B] hover:text-[#2C1810]'
            }`}
          >
            Datos de Tienda
          </button>
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              activeTab === 'catalog' ? 'bg-white text-[#2C1810] shadow-xs' : 'text-[#8C7A6B] hover:text-[#2C1810]'
            }`}
          >
            Catálogo y Tallas
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              activeTab === 'data' ? 'bg-white text-[#2C1810] shadow-xs' : 'text-[#8C7A6B] hover:text-[#2C1810]'
            }`}
          >
            Base de Datos & Demo
          </button>
          <button
            onClick={() => setActiveTab('cloud')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              activeTab === 'cloud' ? 'bg-[#4A6B53] text-white shadow-xs' : 'text-[#8C7A6B] hover:text-[#2C1810]'
            }`}
          >
            Guía Cloud
          </button>
        </div>
      </div>

      {/* TAB 1: Business Profile */}
      {activeTab === 'business' && (
        <div className="bg-[#FFFDF9] rounded-2xl border border-[#E8DFD5] p-6 shadow-xs max-w-3xl space-y-5">
          <div className="border-b border-[#E8DFD5] pb-3">
            <h3 className="font-bold text-[#2C1810] text-sm">Información General de la Marca DogZzz</h3>
            <p className="text-xs text-[#6B5A4E]">
              Estos datos se imprimen en los comprobantes y encabezan los reportes comerciales.
            </p>
          </div>

          <form onSubmit={handleSaveBusiness} className="space-y-4 text-xs">
            <div className="p-3.5 bg-[#4A6B53]/10 border border-[#4A6B53]/20 rounded-xl text-[#2C1810] space-y-1 flex items-start gap-3">
              <Dog className="w-5 h-5 text-[#4A6B53] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-xs text-[#4A6B53]">Identidad Comercial Oficial: DogZzz</span>
                <p className="text-[11px] text-[#4A3B32] mt-0.5">
                  Especialistas en camas para perros diseñadas para su anatomía y confort. Puedes ajustar la razón social o dirección según tus sucursales físicas.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[#4A3B32] font-semibold mb-1">Nombre Comercial de la Tienda *</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E8DFD5] rounded-xl font-bold text-sm bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[#4A3B32] font-semibold mb-1">Eslogan de la Marca</label>
                <input
                  type="text"
                  value={slogan}
                  onChange={(e) => setSlogan(e.target.value)}
                  placeholder="El descanso que mueve sus colitas"
                  className="w-full px-3 py-2 border border-[#E8DFD5] rounded-xl text-xs bg-white text-[#4A6B53] font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[#4A3B32] font-semibold mb-1">Teléfono Principal y WhatsApp</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E8DFD5] rounded-xl font-mono bg-white"
                />
              </div>
              <div>
                <label className="block text-[#4A3B32] font-semibold mb-1">Moneda Operativa</label>
                <input
                  type="text"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E8DFD5] rounded-xl bg-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[#4A3B32] font-semibold mb-1">Dirección de la Tienda / Almacén Central</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E8DFD5] rounded-xl bg-white"
                />
              </div>
              <div>
                <label className="block text-[#4A3B32] font-semibold mb-1">Ciudad y Código Postal</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E8DFD5] rounded-xl bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#4A3B32] font-semibold mb-1">Horarios de Atención</label>
              <input
                type="text"
                value={operatingHours}
                onChange={(e) => setOperatingHours(e.target.value)}
                className="w-full px-3 py-2 border border-[#E8DFD5] rounded-xl bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[#4A3B32] font-semibold mb-1">
                  Costo de Flete de Entrega Predeterminado ($ MXN)
                </label>
                <input
                  type="number"
                  value={defaultDeliveryFee}
                  onChange={(e) => setDefaultDeliveryFee(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-[#E8DFD5] rounded-xl font-mono font-bold bg-white text-[#4A6B53]"
                />
              </div>
              <div>
                <label className="block text-[#4A3B32] font-semibold mb-1">
                  Alerta de Stock Mínimo por Variante
                </label>
                <input
                  type="number"
                  value={defaultMinStock}
                  onChange={(e) => setDefaultMinStock(parseInt(e.target.value) || 2)}
                  className="w-full px-3 py-2 border border-[#E8DFD5] rounded-xl font-mono font-bold bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#E8DFD5]">
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#4A6B53] text-white rounded-xl font-semibold hover:bg-[#3D5944] shadow-xs transition-colors"
              >
                Guardar Datos de Tienda DogZzz
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: Dynamic Catalog Lists */}
      {activeTab === 'catalog' && (
        <div className="bg-[#FFFDF9] rounded-2xl border border-[#E8DFD5] p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-[#E8DFD5] pb-3">
            <div>
              <h3 className="font-bold text-[#2C1810] text-sm">Opciones Configurables del Catálogo Canino</h3>
              <p className="text-xs text-[#6B5A4E]">
                Personaliza las tallas de cama para perros, categorías, materiales y colores disponibles.
              </p>
            </div>
            <button
              onClick={handleSaveCatalog}
              className="px-4 py-2 bg-[#4A6B53] text-white rounded-xl text-xs font-semibold hover:bg-[#3D5944] shadow-xs"
            >
              Guardar Opciones
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Sizes */}
            <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#E8DFD5] space-y-3">
              <h4 className="font-bold text-[#2C1810] flex items-center gap-1.5">
                <Dog className="w-4 h-4 text-[#4A6B53]" />
                Tallas Caninas
              </h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ej. XS (Mini), S, M, L, XL, XXL..."
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-[#E8DFD5] rounded-lg bg-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newSize.trim() && !sizes.includes(newSize.trim())) {
                      setSizes([...sizes, newSize.trim()]);
                      setNewSize('');
                    }
                  }}
                  className="px-3 py-1.5 bg-[#2C1810] text-white rounded-lg font-semibold hover:bg-[#1A0E0A]"
                >
                  + Agregar
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {sizes.map((sz) => (
                  <span
                    key={sz}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#E8DFD5] rounded-lg text-[#2C1810] font-medium"
                  >
                    {sz}
                    <button
                      type="button"
                      onClick={() => setSizes(sizes.filter((s) => s !== sz))}
                      className="text-stone-400 hover:text-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Materials */}
            <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#E8DFD5] space-y-3">
              <h4 className="font-bold text-[#2C1810]">Materiales y Telas Caninas</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ej. Lino Oxford, Felpa Shaggy..."
                  value={newMaterial}
                  onChange={(e) => setNewMaterial(e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-[#E8DFD5] rounded-lg bg-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newMaterial.trim() && !materials.includes(newMaterial.trim())) {
                      setMaterials([...materials, newMaterial.trim()]);
                      setNewMaterial('');
                    }
                  }}
                  className="px-3 py-1.5 bg-[#2C1810] text-white rounded-lg font-semibold hover:bg-[#1A0E0A]"
                >
                  + Agregar
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {materials.map((mat) => (
                  <span
                    key={mat}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#E8DFD5] rounded-lg text-[#2C1810] font-medium"
                  >
                    {mat}
                    <button
                      type="button"
                      onClick={() => setMaterials(materials.filter((m) => m !== mat))}
                      className="text-stone-400 hover:text-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#E8DFD5] space-y-3">
              <h4 className="font-bold text-[#2C1810]">Tipos de Camas (Categorías)</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ej. Camas ortopédicas, Tipo cueva..."
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-[#E8DFD5] rounded-lg bg-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
                      setCategories([...categories, newCategory.trim()]);
                      setNewCategory('');
                    }
                  }}
                  className="px-3 py-1.5 bg-[#2C1810] text-white rounded-lg font-semibold hover:bg-[#1A0E0A]"
                >
                  + Agregar
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {categories.map((cat) => (
                  <span
                    key={cat}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#E8DFD5] rounded-lg text-[#2C1810] font-medium"
                  >
                    {cat}
                    <button
                      type="button"
                      onClick={() => setCategories(categories.filter((c) => c !== cat))}
                      className="text-stone-400 hover:text-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Styles */}
            <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#E8DFD5] space-y-3">
              <h4 className="font-bold text-[#2C1810]">Diseños y Acabados</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ej. Nórdico, Bicolor, Estampado..."
                  value={newStyle}
                  onChange={(e) => setNewStyle(e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-[#E8DFD5] rounded-lg bg-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newStyle.trim() && !styles.includes(newStyle.trim())) {
                      setStyles([...styles, newStyle.trim()]);
                      setNewStyle('');
                    }
                  }}
                  className="px-3 py-1.5 bg-[#2C1810] text-white rounded-lg font-semibold hover:bg-[#1A0E0A]"
                >
                  + Agregar
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {styles.map((st) => (
                  <span
                    key={st}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#E8DFD5] rounded-lg text-[#2C1810] font-medium"
                  >
                    {st}
                    <button
                      type="button"
                      onClick={() => setStyles(styles.filter((s) => s !== st))}
                      className="text-stone-400 hover:text-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Data Management & Backup */}
      {activeTab === 'data' && (
        <div className="bg-[#FFFDF9] rounded-2xl border border-[#E8DFD5] p-6 shadow-xs space-y-6 max-w-3xl">
          <div className="border-b border-[#E8DFD5] pb-3">
            <h3 className="font-bold text-[#2C1810] text-sm">Respaldo y Restauración de Base de Datos</h3>
            <p className="text-xs text-[#6B5A4E]">
              Descarga una copia completa de seguridad en formato JSON con catálogo, clientes y ventas de DogZzz.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#E8DFD5] space-y-3 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-[#2C1810] text-xs">Descargar Respaldo JSON</h4>
                <p className="text-[11px] text-[#6B5A4E] mt-1 leading-relaxed">
                  Genera un archivo portátil que contiene todas las camas registradas con variantes, pedidos, abonos, clientes y movimientos de almacén.
                </p>
              </div>
              <button
                onClick={handleExportJSON}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#4A6B53] text-white rounded-xl text-xs font-semibold hover:bg-[#3D5944] transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Exportar Base de Datos DogZzz</span>
              </button>
            </div>

            <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#E8DFD5] space-y-3 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-[#2C1810] text-xs">Restaurar desde Respaldo</h4>
                <p className="text-[11px] text-[#6B5A4E] mt-1 leading-relaxed">
                  Carga un archivo JSON previamente exportado para recuperar toda la información en caso de cambiar de equipo o navegador.
                </p>
              </div>
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImportFile}
                  accept=".json"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-[#E8DFD5] text-[#4A3B32] rounded-xl text-xs font-semibold hover:bg-[#F0EAE1] transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span>Cargar Archivo JSON</span>
                </button>
              </div>
            </div>
          </div>

          {/* Demo Data Reset */}
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
            <div className="flex items-start gap-3">
              <RefreshCw className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-amber-950 text-xs">Restablecer Datos de Demostración DogZzz</h4>
                <p className="text-[11px] text-amber-900 mt-0.5 leading-relaxed">
                  Recarga los 6 modelos iniciales de camas para perros con sus variantes por talla y color, fotos de estudio, clientes de muestra con perritos y pedidos con cobros y entregas.
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  if (confirm('¿Deseas recargar los datos demo de DogZzz? Tus cambios no guardados se reemplazarán.')) {
                    resetToDemoData();
                  }
                }}
                className="px-4 py-2 bg-amber-800 text-white rounded-xl text-xs font-semibold hover:bg-amber-900 shadow-xs"
              >
                Recargar Datos Demo DogZzz
              </button>
            </div>
          </div>

          {/* Production Mode Clear */}
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-3">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-red-950 text-xs">Iniciar Operación Real en Tienda (Limpiar Base de Datos)</h4>
                <p className="text-[11px] text-red-900 mt-0.5 leading-relaxed">
                  Elimina todos los pedidos ficticios, clientes y movimientos de prueba, dejando únicamente el catálogo base para empezar a registrar ventas reales de mostrador.
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  if (confirm('ADVERTENCIA: ¿Estás seguro de que deseas limpiar las ventas y clientes de prueba para iniciar la operación comercial real de DogZzz?')) {
                    clearToProductionMode();
                  }
                }}
                className="px-4 py-2 bg-red-700 text-white rounded-xl text-xs font-semibold hover:bg-red-800 shadow-xs"
              >
                Limpiar Datos de Prueba y Empezar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Cloud Guide */}
      {activeTab === 'cloud' && (
        <div className="bg-[#FFFDF9] rounded-2xl border border-[#E8DFD5] p-6 shadow-xs space-y-6 max-w-3xl">
          <div className="border-b border-[#E8DFD5] pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-[#2C1810] text-sm">Arquitectura Técnica y Conectividad Nube</h3>
              <p className="text-xs text-[#6B5A4E]">
                Configuración para sucursales multi-terminal sincronizadas con Google Cloud SQL / Firebase.
              </p>
            </div>
            <Cloud className="w-5 h-5 text-[#4A6B53]" />
          </div>

          <div className="space-y-4 text-xs text-[#4A3B32]">
            <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#E8DFD5] space-y-2">
              <h4 className="font-bold text-[#2C1810] flex items-center gap-2">
                <Server className="w-4 h-4 text-[#4A6B53]" />
                Persistencia Local Automática
              </h4>
              <p className="leading-relaxed text-[#6B5A4E]">
                DogZzz guarda instantáneamente cada venta, abono, producto y entrega en el almacenamiento seguro de tu navegador (<code className="bg-stone-200/60 px-1 py-0.5 rounded text-[11px]">localStorage</code> con clave <code className="bg-stone-200/60 px-1 py-0.5 rounded text-[11px]">dogzzz_*_v2</code>). Si cierras la pestaña o reinicias el equipo, todos tus datos permanecen intactos.
              </p>
            </div>

            <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#E8DFD5] space-y-2">
              <h4 className="font-bold text-[#2C1810] flex items-center gap-2">
                <Database className="w-4 h-4 text-[#4A6B53]" />
                Escalabilidad Multi-Sucursal (PostgreSQL / Cloud SQL)
              </h4>
              <p className="leading-relaxed text-[#6B5A4E]">
                Para conectar múltiples computadoras en diferentes sucursales físicas de DogZzz compartiendo el mismo inventario en tiempo real, puedes activar el aprovisionamiento de Cloud SQL o Firebase con los esquemas relacionales incluidos.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
