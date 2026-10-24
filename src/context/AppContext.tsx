import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  ProductVariant,
  Customer,
  Order,
  OrderItem,
  InventoryMovement,
  BusinessSettings,
  AppUser,
  SaleCartItem,
  PaymentMethod,
  PaymentRecord,
  DeliveryDetails,
  DeliveryStatus,
  OrderStatus
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_ORDERS,
  INITIAL_MOVEMENTS,
  INITIAL_SETTINGS,
  INITIAL_USERS
} from '../data/initialData';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

interface AppContextType {
  products: Product[];
  customers: Customer[];
  orders: Order[];
  movements: InventoryMovement[];
  settings: BusinessSettings;
  currentUser: AppUser;
  availableUsers: AppUser[];
  toasts: ToastMessage[];
  showToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, message?: string) => void;
  removeToast: (id: string) => void;
  
  // User Management
  setCurrentUser: (user: AppUser) => void;
  isAdmin: boolean;
  
  // Product & Inventory actions
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => { success: boolean; message: string; product?: Product };
  updateProduct: (id: string, updates: Partial<Product>) => { success: boolean; message: string };
  toggleProductStatus: (id: string) => void;
  toggleFeaturedProduct: (id: string) => void;
  deleteProduct: (id: string) => { success: boolean; message: string };
  adjustInventoryStock: (
    productId: string,
    variantId: string | undefined,
    qtyChange: number,
    reason: string,
    type: 'IN_PURCHASE' | 'IN_ADJUST' | 'OUT_ADJUST'
  ) => { success: boolean; message: string };
  
  // Customer actions
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => { success: boolean; message: string; customer?: Customer; warning?: string };
  updateCustomer: (id: string, updates: Partial<Customer>) => { success: boolean; message: string };
  
  // POS & Sales actions
  processSale: (data: {
    customer: Customer;
    items: SaleCartItem[];
    subtotal: number;
    discount: number;
    deliveryFee: number;
    total: number;
    initialPayment: number;
    paymentMethod: PaymentMethod;
    paymentNotes?: string;
    delivery: {
      required: boolean;
      scheduledDate?: string;
      timeSlot?: string;
      address: string;
      references: string;
      deliveryNotes?: string;
    };
    generalNotes?: string;
  }) => { success: boolean; message: string; order?: Order };
  
  // Order actions
  addPaymentToOrder: (orderId: string, amount: number, method: PaymentMethod, notes?: string) => { success: boolean; message: string };
  updateOrderStatus: (orderId: string, newStatus: OrderStatus, reason?: string) => { success: boolean; message: string };
  updateDeliveryStatus: (orderId: string, newDelivery: Partial<DeliveryDetails>, note?: string) => { success: boolean; message: string };
  cancelOrder: (orderId: string, reason: string) => { success: boolean; message: string };
  
  // Settings & Data actions
  updateSettings: (newSettings: Partial<BusinessSettings>) => void;
  resetToDemoData: () => void;
  clearToProductionMode: () => void;
  exportDatabaseJSON: () => string;
  importDatabaseJSON: (jsonStr: string) => { success: boolean; message: string };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'dogzzz_products_v2',
  CUSTOMERS: 'dogzzz_customers_v2',
  ORDERS: 'dogzzz_orders_v2',
  MOVEMENTS: 'dogzzz_movements_v2',
  SETTINGS: 'dogzzz_settings_v2',
  CURRENT_USER: 'dogzzz_user_v2'
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from localStorage or initialize with DogZzz initial data
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
    } catch {
      return INITIAL_CUSTOMERS;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  const [movements, setMovements] = useState<InventoryMovement[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MOVEMENTS);
      return saved ? JSON.parse(saved) : INITIAL_MOVEMENTS;
    } catch {
      return INITIAL_MOVEMENTS;
    }
  });

  const [settings, setSettings] = useState<BusinessSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  const [availableUsers] = useState<AppUser[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<AppUser>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return saved ? JSON.parse(saved) : INITIAL_USERS[0];
    } catch {
      return INITIAL_USERS[0];
    }
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Persist state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(movements));
  }, [movements]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
  }, [currentUser]);

  // Toast Helpers
  const showToast = (type: 'success' | 'error' | 'info' | 'warning', title: string, message?: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const isAdmin = currentUser.role === 'ADMIN';

  // -------------------------------------------------------------
  // PRODUCTS & INVENTORY (WITH VARIANT DEDUCTION)
  // -------------------------------------------------------------
  const addProduct = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Check SKU duplicate
    if (products.some((p) => p.sku.toLowerCase() === productData.sku.toLowerCase().trim())) {
      showToast('error', 'Código SKU en uso', 'Ya existe un modelo de cama con el código SKU ingresado.');
      return { success: false, message: 'El SKU ya existe' };
    }

    // Ensure variants exist or generate base variant
    let preparedVariants = productData.variants || [];
    if (preparedVariants.length === 0) {
      preparedVariants = [
        {
          id: 'var-' + Date.now() + '-1',
          sku: productData.sku.trim().toUpperCase() + '-' + productData.size,
          size: productData.size,
          color: productData.color || 'Estándar',
          dimensions: productData.dimensions || 'Estándar',
          costPrice: productData.costPrice,
          salePrice: productData.salePrice,
          stock: productData.stock,
          minStockAlert: productData.minStockAlert,
          recommendedBreed: productData.recommendedBreed
        }
      ];
    }

    // Calculate aggregate stock from variants
    const totalVariantStock = preparedVariants.reduce((sum, v) => sum + v.stock, 0);

    const newProduct: Product = {
      ...productData,
      id: 'prod-' + Date.now(),
      sku: productData.sku.trim().toUpperCase(),
      stock: totalVariantStock > 0 ? totalVariantStock : productData.stock,
      variants: preparedVariants,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setProducts((prev) => [newProduct, ...prev]);

    // Initial stock movement
    if (newProduct.stock > 0) {
      const initialMov: InventoryMovement = {
        id: 'mov-' + Date.now(),
        productId: newProduct.id,
        productSku: newProduct.sku,
        productName: newProduct.name,
        type: 'IN_PURCHASE',
        quantity: newProduct.stock,
        previousStock: 0,
        newStock: newProduct.stock,
        reason: 'Registro inicial de cama para perros DogZzz',
        registeredBy: currentUser.name,
        createdAt: new Date().toISOString()
      };
      setMovements((prev) => [initialMov, ...prev]);
    }

    showToast('success', 'Cama para perros registrada', `${newProduct.name} se agregó al catálogo DogZzz.`);
    return { success: true, message: 'Producto registrado', product: newProduct };
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    const target = products.find((p) => p.id === id);
    if (!target) return { success: false, message: 'Producto no encontrado' };

    // Check SKU conflict
    if (updates.sku && updates.sku.toUpperCase() !== target.sku) {
      if (products.some((p) => p.id !== id && p.sku.toLowerCase() === updates.sku!.toLowerCase().trim())) {
        showToast('error', 'Código SKU en uso', 'Ese código SKU ya pertenece a otro modelo.');
        return { success: false, message: 'SKU duplicado' };
      }
    }

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updatedVariants = updates.variants !== undefined ? updates.variants : p.variants;
          const totalStock = updatedVariants && updatedVariants.length > 0
            ? updatedVariants.reduce((sum, v) => sum + v.stock, 0)
            : (updates.stock !== undefined ? updates.stock : p.stock);

          return {
            ...p,
            ...updates,
            variants: updatedVariants,
            stock: totalStock,
            updatedAt: new Date().toISOString()
          };
        }
        return p;
      })
    );

    showToast('success', 'Catálogo actualizado', 'Los datos del modelo y sus variantes han sido guardados.');
    return { success: true, message: 'Producto actualizado' };
  };

  const toggleProductStatus = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const next = !p.isActive;
          showToast('info', next ? 'Cama activada para venta' : 'Cama pausada en catálogo', p.name);
          return { ...p, isActive: next, updatedAt: new Date().toISOString() };
        }
        return p;
      })
    );
  };

  const toggleFeaturedProduct = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const next = !p.isFeatured;
          showToast('info', next ? 'Marcada como Destacada' : 'Removida de Destacadas', p.name);
          return { ...p, isFeatured: next, updatedAt: new Date().toISOString() };
        }
        return p;
      })
    );
  };

  const deleteProduct = (id: string) => {
    const target = products.find((p) => p.id === id);
    if (!target) return { success: false, message: 'Producto no encontrado' };

    // Check if sales exist
    const hasSales = orders.some((ord) => ord.items.some((item) => item.productId === id));
    if (hasSales) {
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isActive: false, updatedAt: new Date().toISOString() } : p))
      );
      showToast(
        'warning',
        'Modelo archivado (No eliminado)',
        `Este modelo cuenta con ventas históricas registradas. Por integridad de folios se marcó como Inactivo.`
      );
      return {
        success: true,
        message: 'Tiene ventas asociadas; se marcó como inactivo.'
      };
    }

    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast('success', 'Producto eliminado', `Se eliminó ${target.name} del catálogo DogZzz.`);
    return { success: true, message: 'Producto eliminado' };
  };

  const adjustInventoryStock = (
    productId: string,
    variantId: string | undefined,
    qtyChange: number,
    reason: string,
    type: 'IN_PURCHASE' | 'IN_ADJUST' | 'OUT_ADJUST'
  ) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return { success: false, message: 'Producto no encontrado' };

    let targetVariant = variantId ? prod.variants.find((v) => v.id === variantId) : prod.variants[0];
    const prevStock = targetVariant ? targetVariant.stock : prod.stock;
    const newStock = prevStock + qtyChange;

    if (newStock < 0) {
      showToast('error', 'Existencia inválida', 'La existencia no puede ser menor a cero.');
      return { success: false, message: 'Existencias insuficientes para este ajuste negativo' };
    }

    const movement: InventoryMovement = {
      id: 'mov-' + Date.now(),
      productId: prod.id,
      variantId: targetVariant?.id,
      productSku: targetVariant ? targetVariant.sku : prod.sku,
      productName: prod.name,
      variantInfo: targetVariant ? `Talla ${targetVariant.size} · ${targetVariant.color}` : undefined,
      type,
      quantity: qtyChange,
      previousStock: prevStock,
      newStock,
      reason: reason.trim() || 'Ajuste manual de almacén DogZzz',
      registeredBy: currentUser.name,
      createdAt: new Date().toISOString()
    };

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          if (p.variants && p.variants.length > 0 && targetVariant) {
            const updatedVariants = p.variants.map((v) =>
              v.id === targetVariant!.id ? { ...v, stock: newStock } : v
            );
            const totalStock = updatedVariants.reduce((sum, v) => sum + v.stock, 0);
            return {
              ...p,
              stock: totalStock,
              variants: updatedVariants,
              updatedAt: new Date().toISOString()
            };
          } else {
            return { ...p, stock: newStock, updatedAt: new Date().toISOString() };
          }
        }
        return p;
      })
    );

    setMovements((prev) => [movement, ...prev]);

    showToast(
      'success',
      'Inventario actualizado',
      `Nuevo stock de ${prod.name} (${targetVariant?.size || ''}): ${newStock} unidades.`
    );
    return { success: true, message: 'Inventario actualizado' };
  };

  // -------------------------------------------------------------
  // CUSTOMERS
  // -------------------------------------------------------------
  const addCustomer = (customerData: Omit<Customer, 'id' | 'createdAt'>) => {
    const cleanPhone = customerData.phone.replace(/\D/g, '');
    const existing = customers.find(
      (c) => cleanPhone && c.phone.replace(/\D/g, '') === cleanPhone
    );

    let warning: string | undefined = undefined;
    if (existing) {
      warning = `Aviso: Ya existe un dueño registrado con el mismo teléfono (${existing.fullName}). Se guardó el nuevo registro.`;
    }

    const newCustomer: Customer = {
      ...customerData,
      id: 'cust-' + Date.now(),
      fullName: customerData.fullName.trim(),
      phone: customerData.phone.trim(),
      email: customerData.email?.trim(),
      petName: customerData.petName?.trim(),
      petBreed: customerData.petBreed?.trim(),
      createdAt: new Date().toISOString()
    };

    setCustomers((prev) => [newCustomer, ...prev]);

    if (warning) {
      showToast('warning', 'Dueño guardado con advertencia', warning);
    } else {
      showToast('success', 'Cliente registrado', `${newCustomer.fullName} fue dado de alta en DogZzz.`);
    }

    return { success: true, message: 'Cliente registrado con éxito', customer: newCustomer, warning };
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    showToast('success', 'Cliente actualizado', 'Los datos del cliente y su mascota se guardaron.');
    return { success: true, message: 'Cliente actualizado' };
  };

  // -------------------------------------------------------------
  // POS & SALES (WITH EXACT VARIANT DEDUCTION)
  // -------------------------------------------------------------
  const processSale = (data: {
    customer: Customer;
    items: SaleCartItem[];
    subtotal: number;
    discount: number;
    deliveryFee: number;
    total: number;
    initialPayment: number;
    paymentMethod: PaymentMethod;
    paymentNotes?: string;
    delivery: {
      required: boolean;
      scheduledDate?: string;
      timeSlot?: string;
      address: string;
      references: string;
      deliveryNotes?: string;
    };
    generalNotes?: string;
  }) => {
    if (data.items.length === 0) {
      showToast('error', 'Carrito vacío', 'Agrega al menos una cama para perros para procesar la venta.');
      return { success: false, message: 'El carrito está vacío' };
    }

    // Variant-level atomic stock validation
    for (const item of data.items) {
      const liveProd = products.find((p) => p.id === item.product.id);
      if (!liveProd) {
        showToast('error', 'Producto no disponible', `El modelo ${item.product.name} no se encontró.`);
        return { success: false, message: `Producto no encontrado: ${item.product.name}` };
      }

      const variant = item.variantId ? liveProd.variants.find((v) => v.id === item.variantId) : null;
      const availableStock = variant ? variant.stock : liveProd.stock;

      if (availableStock < item.quantity) {
        const variantText = variant ? `(Talla ${variant.size} - ${variant.color})` : '';
        showToast(
          'error',
          'Stock insuficiente',
          `Solo hay ${availableStock} unidad(es) de ${liveProd.name} ${variantText}. Solicitadas: ${item.quantity}.`
        );
        return {
          success: false,
          message: `Stock insuficiente para ${liveProd.name} ${variantText}. Disponibles: ${availableStock}`
        };
      }
    }

    // Generate unique sequential folio
    const year = new Date().getFullYear();
    const countToday = orders.length + 1;
    const folio = `VTA-${year}-${String(countToday).padStart(4, '0')}`;
    const orderId = 'ord-' + Date.now();
    const nowISO = new Date().toISOString();

    const finalTotal = Math.max(0, data.total);
    const paid = Math.min(finalTotal, Math.max(0, data.initialPayment));
    const balancePending = Math.max(0, finalTotal - paid);

    const paymentRecords: PaymentRecord[] = paid > 0 ? [
      {
        id: 'pay-' + Date.now(),
        amount: paid,
        method: data.paymentMethod,
        date: nowISO,
        notes: data.paymentNotes || (balancePending === 0 ? 'Liquidación total en mostrador DogZzz' : 'Anticipo inicial'),
        registeredBy: currentUser.name
      }
    ] : [];

    const deliveryStatus: DeliveryStatus = data.delivery.required
      ? data.delivery.scheduledDate ? 'PROGRAMADA' : 'SIN_PROGRAMAR'
      : 'SIN_PROGRAMAR';

    const deliveryDetails: DeliveryDetails = {
      required: data.delivery.required,
      status: deliveryStatus,
      scheduledDate: data.delivery.scheduledDate,
      timeSlot: data.delivery.timeSlot || '10:00 - 14:00',
      recipientName: data.customer.fullName,
      recipientPhone: data.customer.phone,
      address: data.delivery.required ? data.delivery.address : 'Mostrador Tienda DogZzz',
      references: data.delivery.references,
      deliveryFee: data.deliveryFee,
      deliveryNotes: data.delivery.deliveryNotes
    };

    let initialOrderStatus: OrderStatus = 'CONFIRMADO';
    if (!data.delivery.required) {
      initialOrderStatus = balancePending === 0 ? 'LISTO_RECOGER' : 'PENDIENTE';
    }

    const order: Order = {
      id: orderId,
      folio,
      customerId: data.customer.id,
      customerName: data.customer.fullName,
      customerPhone: data.customer.phone,
      customerAddress: data.customer.deliveryAddress,
      petName: data.customer.petName,
      items: data.items.map((i) => ({
        productId: i.product.id,
        variantId: i.variantId,
        productSku: i.variantSku || i.product.sku,
        productName: i.product.name,
        size: i.size,
        color: i.color,
        dimensions: i.dimensions,
        unitPrice: i.unitPrice,
        costPrice: i.product.costPrice,
        quantity: i.quantity,
        subtotal: i.subtotal
      })),
      subtotal: data.subtotal,
      discount: data.discount,
      deliveryFee: data.deliveryFee,
      total: finalTotal,
      amountPaid: paid,
      balancePending,
      paymentMethod: data.paymentMethod,
      payments: paymentRecords,
      orderStatus: initialOrderStatus,
      delivery: deliveryDetails,
      notes: data.generalNotes,
      createdBy: currentUser.name,
      createdAt: nowISO,
      updatedAt: nowISO,
      timeline: [
        {
          id: 'evt-' + Date.now() + '-1',
          date: nowISO,
          action: 'Venta registrada',
          description: `Venta registrada con folio ${folio} por ${currentUser.name} en DogZzz`,
          user: currentUser.name
        },
        ...(paid > 0 ? [{
          id: 'evt-' + Date.now() + '-2',
          date: nowISO,
          action: balancePending === 0 ? 'Pago completo recibido' : 'Anticipo recibido',
          description: `Cobro de $${paid.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN vía ${data.paymentMethod}. Saldo restante: $${balancePending.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`,
          user: currentUser.name
        }] : []),
        ...(data.delivery.required && data.delivery.scheduledDate ? [{
          id: 'evt-' + Date.now() + '-3',
          date: nowISO,
          action: 'Entrega programada',
          description: `Programada para el ${data.delivery.scheduledDate} (${data.delivery.timeSlot || 'Horario abierto'})`,
          user: currentUser.name
        }] : [])
      ]
    };

    // Atomically discount stock per exact variant & create inventory movements
    const movementsToCreate: InventoryMovement[] = [];
    setProducts((prev) =>
      prev.map((p) => {
        const soldItemsForThisProduct = data.items.filter((item) => item.product.id === p.id);
        if (soldItemsForThisProduct.length === 0) return p;

        let updatedVariants = p.variants ? [...p.variants] : [];
        let totalDeducted = 0;

        soldItemsForThisProduct.forEach((sold) => {
          totalDeducted += sold.quantity;

          if (updatedVariants.length > 0 && sold.variantId) {
            updatedVariants = updatedVariants.map((v) => {
              if (v.id === sold.variantId) {
                const newVarStock = v.stock - sold.quantity;
                movementsToCreate.push({
                  id: 'mov-' + Date.now() + '-' + v.id,
                  productId: p.id,
                  variantId: v.id,
                  productSku: v.sku,
                  productName: p.name,
                  variantInfo: `Talla ${v.size} · ${v.color}`,
                  type: 'OUT_SALE',
                  quantity: -sold.quantity,
                  previousStock: v.stock,
                  newStock: newVarStock,
                  reason: `Venta confirmada Folio ${folio} DogZzz`,
                  orderFolio: folio,
                  registeredBy: currentUser.name,
                  createdAt: nowISO
                });
                return { ...v, stock: newVarStock };
              }
              return v;
            });
          } else {
            // No variant specified, deduct from main stock
            movementsToCreate.push({
              id: 'mov-' + Date.now() + '-' + p.id,
              productId: p.id,
              productSku: p.sku,
              productName: p.name,
              type: 'OUT_SALE',
              quantity: -sold.quantity,
              previousStock: p.stock,
              newStock: p.stock - sold.quantity,
              reason: `Venta confirmada Folio ${folio} DogZzz`,
              orderFolio: folio,
              registeredBy: currentUser.name,
              createdAt: nowISO
            });
          }
        });

        const newAggregateStock = updatedVariants.length > 0
          ? updatedVariants.reduce((sum, v) => sum + v.stock, 0)
          : p.stock - totalDeducted;

        return {
          ...p,
          stock: newAggregateStock,
          variants: updatedVariants,
          updatedAt: nowISO
        };
      })
    );

    setMovements((prev) => [...movementsToCreate, ...prev]);
    setOrders((prev) => [order, ...prev]);

    showToast('success', '¡Venta registrada con éxito!', `Folio ${folio} generado en DogZzz. Inventario descontado.`);
    return { success: true, message: 'Venta registrada con éxito', order };
  };

  // -------------------------------------------------------------
  // ORDER ACTIONS & PAYMENTS
  // -------------------------------------------------------------
  const addPaymentToOrder = (orderId: string, amount: number, method: PaymentMethod, notes?: string) => {
    const target = orders.find((o) => o.id === orderId);
    if (!target) return { success: false, message: 'Pedido no encontrado' };

    if (amount <= 0) {
      showToast('error', 'Monto inválido', 'El abono debe ser mayor a $0.');
      return { success: false, message: 'Monto inválido' };
    }

    if (amount > target.balancePending) {
      showToast(
        'error',
        'Monto excede saldo',
        `El saldo pendiente es de $${target.balancePending.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN.`
      );
      return { success: false, message: 'El importe excede el saldo pendiente' };
    }

    const nowISO = new Date().toISOString();
    const newPaid = target.amountPaid + amount;
    const newBalance = Math.max(0, target.balancePending - amount);

    const paymentRecord: PaymentRecord = {
      id: 'pay-' + Date.now(),
      amount,
      method,
      date: nowISO,
      notes: notes || 'Abono a cuenta DogZzz',
      registeredBy: currentUser.name
    };

    const newTimelineEvent = {
      id: 'evt-' + Date.now(),
      date: nowISO,
      action: newBalance === 0 ? 'Saldo liquidado' : 'Abono registrado',
      description: `Abono de $${amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN vía ${method}. Saldo restante: $${newBalance.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`,
      user: currentUser.name
    };

    let nextOrderStatus = target.orderStatus;
    if (newBalance === 0 && target.delivery.status === 'ENTREGADA') {
      nextOrderStatus = 'COMPLETADO';
    }

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            amountPaid: newPaid,
            balancePending: newBalance,
            payments: [...o.payments, paymentRecord],
            orderStatus: nextOrderStatus,
            updatedAt: nowISO,
            timeline: [...o.timeline, newTimelineEvent]
          };
        }
        return o;
      })
    );

    showToast(
      'success',
      'Abono registrado',
      `Se abonaron $${amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN al pedido ${target.folio}.`
    );
    return { success: true, message: 'Pago registrado con éxito' };
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus, reason?: string) => {
    const target = orders.find((o) => o.id === orderId);
    if (!target) return { success: false, message: 'Pedido no encontrado' };

    const nowISO = new Date().toISOString();
    const event = {
      id: 'evt-' + Date.now(),
      date: nowISO,
      action: 'Estado actualizado',
      description: `Estado cambiado a ${newStatus}${reason ? `. Motivo: ${reason}` : ''}`,
      user: currentUser.name
    };

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus, updatedAt: nowISO, timeline: [...o.timeline, event] } : o))
    );

    showToast('info', 'Estado de pedido actualizado', `${target.folio} ahora está en: ${newStatus}`);
    return { success: true, message: 'Estado actualizado' };
  };

  const updateDeliveryStatus = (orderId: string, newDelivery: Partial<DeliveryDetails>, note?: string) => {
    const target = orders.find((o) => o.id === orderId);
    if (!target) return { success: false, message: 'Pedido no encontrado' };

    const nowISO = new Date().toISOString();
    const updatedDelivery: DeliveryDetails = {
      ...target.delivery,
      ...newDelivery
    };

    if (newDelivery.status === 'ENTREGADA' && !updatedDelivery.deliveredAt) {
      updatedDelivery.deliveredAt = nowISO;
    }

    let nextOrderStatus = target.orderStatus;
    if (newDelivery.status === 'ENTREGADA') {
      nextOrderStatus = target.balancePending === 0 ? 'COMPLETADO' : 'EN_CAMINO';
    } else if (newDelivery.status === 'EN_CAMINO') {
      nextOrderStatus = 'EN_CAMINO';
    }

    const actionText = newDelivery.status ? `Entrega: ${newDelivery.status}` : 'Logística actualizada';
    const descriptionText = note || (newDelivery.status === 'ENTREGADA'
      ? `Cama para perro entregada con éxito a ${target.customerName}`
      : newDelivery.status === 'REPROGRAMADA'
      ? `Entrega reprogramada para el ${newDelivery.scheduledDate}`
      : 'Modificación de ruta de entrega DogZzz');

    const event = {
      id: 'evt-' + Date.now(),
      date: nowISO,
      action: actionText,
      description: descriptionText,
      user: currentUser.name
    };

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            delivery: updatedDelivery,
            orderStatus: nextOrderStatus,
            updatedAt: nowISO,
            timeline: [...o.timeline, event]
          };
        }
        return o;
      })
    );

    showToast('success', 'Entrega actualizada', `Pedido ${target.folio} actualizado.`);
    return { success: true, message: 'Entrega actualizada' };
  };

  const cancelOrder = (orderId: string, reason: string) => {
    const target = orders.find((o) => o.id === orderId);
    if (!target) return { success: false, message: 'Pedido no encontrado' };

    if (target.orderStatus === 'CANCELADO') {
      return { success: false, message: 'El pedido ya se encuentra cancelado' };
    }

    const nowISO = new Date().toISOString();

    // Restore exact variant stock & log return movements
    const movementsToCreate: InventoryMovement[] = [];
    setProducts((prev) =>
      prev.map((p) => {
        const itemsToRestore = target.items.filter((i) => i.productId === p.id);
        if (itemsToRestore.length === 0) return p;

        let updatedVariants = p.variants ? [...p.variants] : [];
        let totalRestored = 0;

        itemsToRestore.forEach((item) => {
          totalRestored += item.quantity;

          if (updatedVariants.length > 0 && item.variantId) {
            updatedVariants = updatedVariants.map((v) => {
              if (v.id === item.variantId) {
                const restoredVarStock = v.stock + item.quantity;
                movementsToCreate.push({
                  id: 'mov-' + Date.now() + '-' + v.id,
                  productId: p.id,
                  variantId: v.id,
                  productSku: v.sku,
                  productName: p.name,
                  variantInfo: `Talla ${v.size} · ${v.color}`,
                  type: 'RETURN_CANCEL',
                  quantity: item.quantity,
                  previousStock: v.stock,
                  newStock: restoredVarStock,
                  reason: `Devolución por cancelación Folio ${target.folio}. Motivo: ${reason}`,
                  orderFolio: target.folio,
                  registeredBy: currentUser.name,
                  createdAt: nowISO
                });
                return { ...v, stock: restoredVarStock };
              }
              return v;
            });
          } else {
            const restoredStock = p.stock + item.quantity;
            movementsToCreate.push({
              id: 'mov-' + Date.now() + '-' + p.id,
              productId: p.id,
              productSku: p.sku,
              productName: p.name,
              type: 'RETURN_CANCEL',
              quantity: item.quantity,
              previousStock: p.stock,
              newStock: restoredStock,
              reason: `Devolución por cancelación Folio ${target.folio}. Motivo: ${reason}`,
              orderFolio: target.folio,
              registeredBy: currentUser.name,
              createdAt: nowISO
            });
          }
        });

        const newAggregateStock = updatedVariants.length > 0
          ? updatedVariants.reduce((sum, v) => sum + v.stock, 0)
          : p.stock + totalRestored;

        return {
          ...p,
          stock: newAggregateStock,
          variants: updatedVariants,
          updatedAt: nowISO
        };
      })
    );

    setMovements((prev) => [...movementsToCreate, ...prev]);

    const cancelEvent = {
      id: 'evt-' + Date.now(),
      date: nowISO,
      action: 'Venta cancelada',
      description: `Pedido cancelado por ${currentUser.name}. Motivo: ${reason}. Se reintegraron las camas al inventario.`,
      user: currentUser.name
    };

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            orderStatus: 'CANCELADO',
            cancellationReason: reason,
            cancelledAt: nowISO,
            delivery: {
              ...o.delivery,
              status: 'CANCELADA'
            },
            updatedAt: nowISO,
            timeline: [...o.timeline, cancelEvent]
          };
        }
        return o;
      })
    );

    showToast(
      'warning',
      'Venta cancelada',
      `Pedido ${target.folio} cancelado en DogZzz. Las existencias de las variantes fueron reintegradas.`
    );
    return { success: true, message: 'Pedido cancelado e inventario devuelto' };
  };

  // -------------------------------------------------------------
  // SETTINGS & DEMO MANAGEMENT
  // -------------------------------------------------------------
  const updateSettings = (newSettings: Partial<BusinessSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    showToast('success', 'Configuración guardada', 'Los ajustes de DogZzz se han actualizado.');
  };

  const resetToDemoData = () => {
    setProducts(INITIAL_PRODUCTS);
    setCustomers(INITIAL_CUSTOMERS);
    setOrders(INITIAL_ORDERS);
    setMovements(INITIAL_MOVEMENTS);
    setSettings({ ...INITIAL_SETTINGS, isDemoMode: true });
    showToast('info', 'Catálogo de prueba cargado', 'Se cargaron camas para perros DogZzz con variantes, clientes y pedidos de muestra.');
  };

  const clearToProductionMode = () => {
    setOrders([]);
    setMovements([]);
    setCustomers([]);
    setSettings((prev) => ({ ...prev, isDemoMode: false }));
    showToast('success', 'Modo Producción Activado', 'Historial reiniciado para operar con clientes y ventas reales en DogZzz.');
  };

  const exportDatabaseJSON = () => {
    const backup = {
      exportDate: new Date().toISOString(),
      businessName: settings.businessName,
      version: '2.0-dogzzz',
      data: {
        settings,
        products,
        customers,
        orders,
        movements
      }
    };
    return JSON.stringify(backup, null, 2);
  };

  const importDatabaseJSON = (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed.data || !Array.isArray(parsed.data.products)) {
        return { success: false, message: 'El archivo JSON no tiene un formato válido de base de datos DogZzz.' };
      }
      if (parsed.data.settings) setSettings(parsed.data.settings);
      if (parsed.data.products) setProducts(parsed.data.products);
      if (parsed.data.customers) setCustomers(parsed.data.customers);
      if (parsed.data.orders) setOrders(parsed.data.orders);
      if (parsed.data.movements) setMovements(parsed.data.movements);

      showToast('success', 'Respaldo restaurado', 'Los datos de DogZzz se importaron correctamente.');
      return { success: true, message: 'Datos importados con éxito' };
    } catch {
      return { success: false, message: 'Error de sintaxis JSON al leer el archivo.' };
    }
  };

  return (
    <AppContext.Provider
      value={{
        products,
        customers,
        orders,
        movements,
        settings,
        currentUser,
        availableUsers,
        toasts,
        showToast,
        removeToast,
        setCurrentUser,
        isAdmin,
        addProduct,
        updateProduct,
        toggleProductStatus,
        toggleFeaturedProduct,
        deleteProduct,
        adjustInventoryStock,
        addCustomer,
        updateCustomer,
        processSale,
        addPaymentToOrder,
        updateOrderStatus,
        updateDeliveryStatus,
        cancelOrder,
        updateSettings,
        resetToDemoData,
        clearToProductionMode,
        exportDatabaseJSON,
        importDatabaseJSON
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe ser utilizado dentro de un AppProvider');
  }
  return context;
};
