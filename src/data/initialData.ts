import { Product, Customer, Order, InventoryMovement, BusinessSettings, AppUser } from '../types';

export const INITIAL_SETTINGS: BusinessSettings = {
  businessName: 'DogZzz',
  slogan: 'El descanso que mueve sus colitas',
  logoUrl: '/src/assets/images/dogzzz_brand_logo_1792871852948.jpg',
  phone: '55 5890 2341',
  address: 'Av. Insurgentes Sur 1420, Col. Del Valle',
  city: 'Ciudad de México, CP 03100',
  operatingHours: 'Lunes a Sábado: 09:30 - 19:30 | Domingo: 11:00 - 17:00',
  currency: 'MXN ($)',
  defaultDeliveryFee: 150,
  defaultMinStock: 3,
  categories: [
    'Camas acolchadas',
    'Camas tipo dona',
    'Camas ortopédicas',
    'Camas elevadas',
    'Camas tipo sofá',
    'Camas tipo cueva',
    'Colchonetas',
    'Camas impermeables'
  ],
  sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  materials: [
    'Felpa Ultra Suave Anti-Ansiedad',
    'Espuma Viscoelástica Memory Foam',
    'Lino Transpirable Lavable',
    'Oxford Impermeable 600D',
    'Terciopelo Premium Antimanchas',
    'Malla Textileno Transpirable',
    'Sherpa Térmico Tipo Borrego'
  ],
  colors: [
    'Beige Arena',
    'Café Chocolate',
    'Verde Salvia',
    'Gris Grafito',
    'Terracota Suave',
    'Crema Vainilla'
  ],
  paymentMethods: [
    'Efectivo',
    'Tarjeta de Débito/Crédito',
    'Transferencia Bancaria',
    'Pago Mixto',
    'Crédito / A plazos'
  ],
  isDemoMode: true
};

export const INITIAL_USERS: AppUser[] = [
  { id: 'usr-1', name: 'Carlos Mendoza', role: 'ADMIN', title: 'Administrador General' },
  { id: 'usr-2', name: 'Mariana López', role: 'EMPLEADO', title: 'Asesora en Tienda DogZzz' },
  { id: 'usr-3', name: 'Roberto Díaz', role: 'EMPLEADO', title: 'Coordinador de Entregas' }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    sku: 'DOG-DONUT-01',
    name: 'Cama Dona Felpa Relajante Anti-Ansiedad',
    category: 'Camas tipo dona',
    bedType: 'Camas tipo dona',
    size: 'M',
    recommendedBreed: 'Beagle, Bulldog Francés, Pug (hasta 15 kg)',
    outerMaterial: 'Felpa Ultra Suave Anti-Ansiedad',
    fillingMaterial: 'Fibra de Poliéster Siliconada Virgen Air-Fluff',
    color: 'Beige Arena',
    dimensions: '80 cm diámetro x 22 cm altura',
    specialFeatures: 'Borde elevado de seguridad, base impermeable con puntos antideslizantes, lavable en lavadora.',
    description: 'Nuestra cama más popular. Los bordes circulares elevados brindan soporte para la cabeza y el cuello, mientras que el relleno ultra esponjoso alivia el dolor articular y muscular de tu peludo.',
    costPrice: 420,
    salePrice: 890,
    stock: 15,
    minStockAlert: 4,
    warehouseLocation: 'Anaquel A - Estante 01',
    photoUrl: '/src/assets/images/dog_bed_donut_plush_1792871854634.jpg',
    isActive: true,
    isFeatured: true,
    variants: [
      {
        id: 'var-001-s',
        sku: 'DOG-DONUT-01-S-BEI',
        size: 'S',
        color: 'Beige Arena',
        dimensions: '60 cm diámetro x 20 cm altura',
        costPrice: 320,
        salePrice: 650,
        stock: 6,
        minStockAlert: 2,
        recommendedBreed: 'Chihuahua, Pomerania, Shih Tzu (hasta 7 kg)'
      },
      {
        id: 'var-001-m',
        sku: 'DOG-DONUT-01-M-BEI',
        size: 'M',
        color: 'Beige Arena',
        dimensions: '80 cm diámetro x 22 cm altura',
        costPrice: 420,
        salePrice: 890,
        stock: 5,
        minStockAlert: 3,
        recommendedBreed: 'Beagle, Bulldog Francés, Pug (hasta 15 kg)'
      },
      {
        id: 'var-001-l',
        sku: 'DOG-DONUT-01-L-BEI',
        size: 'L',
        color: 'Beige Arena',
        dimensions: '100 cm diámetro x 24 cm altura',
        costPrice: 580,
        salePrice: 1180,
        stock: 4,
        minStockAlert: 2,
        recommendedBreed: 'Golden Retriever, Labrador, Dálmata (hasta 30 kg)'
      }
    ],
    createdAt: '2026-09-01T10:00:00Z',
    updatedAt: '2026-10-20T10:00:00Z'
  },
  {
    id: 'prod-002',
    sku: 'DOG-ORTHO-02',
    name: 'Cama Sofá Ortopédica Memory Foam Lounge',
    category: 'Camas ortopédicas',
    bedType: 'Camas ortopédicas',
    size: 'L',
    recommendedBreed: 'Golden Retriever, Pastor Alemán, Boxer (25-35 kg)',
    outerMaterial: 'Lino Transpirable Lavable con Bolsters',
    fillingMaterial: 'Espuma Viscoelástica Memory Foam de Alta Densidad (7 cm)',
    color: 'Café Chocolate',
    dimensions: '95 x 75 x 22 cm',
    specialFeatures: 'Colchón ortopédico de grado médico que no se deforma, cojines perimetrales ergonómicos, funda con cierre desmontable.',
    description: 'Diseñada por veterinarios para perros adultos mayores o con displasia de cadera. Distribuye el peso de manera uniforme y alivia la presión en codos y columna.',
    costPrice: 950,
    salePrice: 1890,
    stock: 9,
    minStockAlert: 3,
    warehouseLocation: 'Anaquel A - Estante 03',
    photoUrl: '/src/assets/images/dog_bed_orthopedic_sofa_1792871855558.jpg',
    isActive: true,
    isFeatured: true,
    variants: [
      {
        id: 'var-002-m',
        sku: 'DOG-ORTHO-02-M-CHO',
        size: 'M',
        color: 'Café Chocolate',
        dimensions: '75 x 55 x 20 cm',
        costPrice: 750,
        salePrice: 1450,
        stock: 4,
        minStockAlert: 2,
        recommendedBreed: 'Corgi, Cocker Spaniel, Schnauzer (hasta 18 kg)'
      },
      {
        id: 'var-002-l',
        sku: 'DOG-ORTHO-02-L-CHO',
        size: 'L',
        color: 'Café Chocolate',
        dimensions: '95 x 75 x 22 cm',
        costPrice: 950,
        salePrice: 1890,
        stock: 3,
        minStockAlert: 2,
        recommendedBreed: 'Golden Retriever, Pastor Alemán (hasta 35 kg)'
      },
      {
        id: 'var-002-xl',
        sku: 'DOG-ORTHO-02-XL-CHO',
        size: 'XL',
        color: 'Café Chocolate',
        dimensions: '120 x 90 x 24 cm',
        costPrice: 1200,
        salePrice: 2350,
        stock: 2,
        minStockAlert: 2,
        recommendedBreed: 'Gran Danés, San Bernardo, Rottweiler (más de 40 kg)'
      }
    ],
    createdAt: '2026-09-02T11:00:00Z',
    updatedAt: '2026-10-22T14:30:00Z'
  },
  {
    id: 'prod-003',
    sku: 'DOG-CAVE-03',
    name: 'Cama Cueva Acolchada Madriguera Calientita',
    category: 'Camas tipo cueva',
    bedType: 'Camas tipo cueva',
    size: 'S',
    recommendedBreed: 'Dachshund / Salchicha, Chihuahua, Boston Terrier',
    outerMaterial: 'Lona de Algodón Verde Salvia & Forro Sherpa',
    fillingMaterial: 'Fibra Siliconada Térmica con Capota Flexible',
    color: 'Verde Salvia',
    dimensions: '55 x 55 x 35 cm',
    specialFeatures: 'Capota tipo iglú semiabierta que permite a perros madrigueros cubrirse por sí mismos. Forro interior de borreguito térmico.',
    description: 'La consentida de perros friolentos que aman meterse bajo las sábanas. Brinda oscuridad, calor envolvente y sensación de protección inmediata.',
    costPrice: 380,
    salePrice: 750,
    stock: 7,
    minStockAlert: 2,
    warehouseLocation: 'Anaquel B - Estante 02',
    photoUrl: '/src/assets/images/dog_bed_cave_burrow_1792871855066.jpg',
    isActive: true,
    isFeatured: true,
    variants: [
      {
        id: 'var-003-xs',
        sku: 'DOG-CAVE-03-XS-SAL',
        size: 'XS',
        color: 'Verde Salvia',
        dimensions: '45 x 45 x 30 cm',
        costPrice: 310,
        salePrice: 590,
        stock: 4,
        minStockAlert: 2,
        recommendedBreed: 'Chihuahua mini, Yorkie, Gatos (hasta 4 kg)'
      },
      {
        id: 'var-003-s',
        sku: 'DOG-CAVE-03-S-SAL',
        size: 'S',
        color: 'Verde Salvia',
        dimensions: '55 x 55 x 35 cm',
        costPrice: 380,
        salePrice: 750,
        stock: 3,
        minStockAlert: 2,
        recommendedBreed: 'Salchicha Teckel, Jack Russell, Pug (hasta 9 kg)'
      }
    ],
    createdAt: '2026-09-05T09:00:00Z',
    updatedAt: '2026-10-18T16:00:00Z'
  },
  {
    id: 'prod-004',
    sku: 'DOG-ELEV-04',
    name: 'Cama Elevada Transpirable Cot AirFlow',
    category: 'Camas elevadas',
    bedType: 'Camas elevadas',
    size: 'L',
    recommendedBreed: 'Pastor Alemán, Husky Siberiano, Border Collie',
    outerMaterial: 'Malla Textileno Transpirable Alta Densidad',
    fillingMaterial: 'Estructura de Acero Galvanizado Anticorrosión',
    color: 'Gris Grafito',
    dimensions: '105 x 75 x 18 cm',
    specialFeatures: 'Mantiene a la mascota alejada del suelo frío o caliente, libre de pulgas y humedad. Apta para jardín, terraza o interior.',
    description: 'Perfecta para climas cálidos y perros con pelaje denso. El flujo continuo de aire por debajo de la cama previene dermatitis y golpes de calor.',
    costPrice: 580,
    salePrice: 1150,
    stock: 8,
    minStockAlert: 3,
    warehouseLocation: 'Anaquel B - Estante 04',
    photoUrl: '/src/assets/images/dog_bed_elevated_outdoor_1792871855586.jpg',
    isActive: true,
    isFeatured: true,
    variants: [
      {
        id: 'var-004-m',
        sku: 'DOG-ELEV-04-M-GRA',
        size: 'M',
        color: 'Gris Grafito',
        dimensions: '78 x 60 x 18 cm',
        costPrice: 420,
        salePrice: 820,
        stock: 3,
        minStockAlert: 2,
        recommendedBreed: 'Schnauzer, Beagle, Bulldog Francés (hasta 20 kg)'
      },
      {
        id: 'var-004-l',
        sku: 'DOG-ELEV-04-L-GRA',
        size: 'L',
        color: 'Gris Grafito',
        dimensions: '105 x 75 x 18 cm',
        costPrice: 580,
        salePrice: 1150,
        stock: 3,
        minStockAlert: 2,
        recommendedBreed: 'Labrador, Husky, Pastor Australiano (hasta 40 kg)'
      },
      {
        id: 'var-004-xl',
        sku: 'DOG-ELEV-04-XL-GRA',
        size: 'XL',
        color: 'Gris Grafito',
        dimensions: '125 x 85 x 20 cm',
        costPrice: 720,
        salePrice: 1420,
        stock: 2,
        minStockAlert: 1,
        recommendedBreed: 'Gran Danés, Mastín, San Bernardo (hasta 60 kg)'
      }
    ],
    createdAt: '2026-09-10T12:00:00Z',
    updatedAt: '2026-10-15T11:20:00Z'
  },
  {
    id: 'prod-005',
    sku: 'DOG-MAT-05',
    name: 'Colchoneta Impermeable Todo Terreno Aventura',
    category: 'Colchonetas',
    bedType: 'Colchonetas',
    size: 'XL',
    recommendedBreed: 'Perros aventureros de todas las razas y tamaños',
    outerMaterial: 'Oxford Impermeable 600D Antidesgarros',
    fillingMaterial: 'Espuma de Alta Resiliencia HR 5 cm',
    color: 'Verde Salvia',
    dimensions: '110 x 80 x 6 cm',
    specialFeatures: 'Fácil de enrollar con asas de transporte, repelente a lodo, agua y pelo. Se limpia con un trapo húmedo.',
    description: 'La colchoneta ideal para llevar en la cajuela del auto, viajes a la playa, campamentos o terrazas. Prácticamente indestructible y 100% impermeable.',
    costPrice: 390,
    salePrice: 790,
    stock: 2, // Alerta stock bajo
    minStockAlert: 3,
    warehouseLocation: 'Anaquel C - Estante 01',
    photoUrl: '/src/assets/images/dog_bed_donut_plush_1792871854634.jpg',
    isActive: true,
    isFeatured: false,
    variants: [
      {
        id: 'var-005-m',
        sku: 'DOG-MAT-05-M-SAL',
        size: 'M',
        color: 'Verde Salvia',
        dimensions: '80 x 60 x 5 cm',
        costPrice: 290,
        salePrice: 590,
        stock: 1,
        minStockAlert: 2,
        recommendedBreed: 'Perros medianos (10-20 kg)'
      },
      {
        id: 'var-005-xl',
        sku: 'DOG-MAT-05-XL-SAL',
        size: 'XL',
        color: 'Verde Salvia',
        dimensions: '110 x 80 x 6 cm',
        costPrice: 390,
        salePrice: 790,
        stock: 1,
        minStockAlert: 2,
        recommendedBreed: 'Perros grandes (20-40 kg)'
      }
    ],
    createdAt: '2026-09-12T15:00:00Z',
    updatedAt: '2026-10-23T09:15:00Z'
  },
  {
    id: 'prod-006',
    sku: 'DOG-SOFA-06',
    name: 'Cama Sofá Nórdico Terciopelo Suave',
    category: 'Camas tipo sofá',
    bedType: 'Camas tipo sofá',
    size: 'M',
    recommendedBreed: 'Bulldog Francés, Pug, Schnauzer, Caniche',
    outerMaterial: 'Terciopelo Premium Antimanchas',
    fillingMaterial: 'Espuma Viscoelástica Ortopédica + Fibra',
    color: 'Terracota Suave',
    dimensions: '80 x 60 x 22 cm',
    specialFeatures: 'Diseño elegante que combina con la sala de estar de tu casa. Patas redondeadas de madera maciza.',
    description: 'Para los dueños que aman el diseño interior. Esta cama sofá luce como un mueble de lujo en cualquier sala, ofreciendo el máximo confort a tu perrhijo.',
    costPrice: 850,
    salePrice: 1690,
    stock: 0, // Agotado
    minStockAlert: 2,
    warehouseLocation: 'Zona Exhibición Tienda',
    photoUrl: '/src/assets/images/dog_bed_orthopedic_sofa_1792871855558.jpg',
    isActive: true,
    isFeatured: false,
    variants: [
      {
        id: 'var-006-m',
        sku: 'DOG-SOFA-06-M-TER',
        size: 'M',
        color: 'Terracota Suave',
        dimensions: '80 x 60 x 22 cm',
        costPrice: 850,
        salePrice: 1690,
        stock: 0,
        minStockAlert: 2,
        recommendedBreed: 'Bulldog Francés, Pug, Schnauzer (hasta 15 kg)'
      }
    ],
    createdAt: '2026-09-15T10:00:00Z',
    updatedAt: '2026-10-24T08:00:00Z'
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-001',
    fullName: 'Valeria Sánchez Morales',
    phone: '55 4123 9870',
    email: 'valeria.sanchez@email.com',
    petName: 'Milo (Golden Retriever, 3 años)',
    petBreed: 'Golden Retriever',
    deliveryAddress: 'Calle Sonora 189, Depto 402, Col. Condesa',
    addressReferences: 'Edificio color verde agua, frente al Parque España. Hay elevador de servicio.',
    notes: 'Milo duerme de lado y necesita cama extra grande con soporte de cabeza.',
    createdAt: '2026-09-15T14:20:00Z'
  },
  {
    id: 'cust-002',
    fullName: 'Héctor Gómez Villalobos',
    phone: '55 6789 1234',
    email: 'hector.gomez@gmail.com',
    petName: 'Rocky (Bulldog Francés, 5 años)',
    petBreed: 'Bulldog Francés',
    deliveryAddress: 'Paseo de las Palmas 740, Casa 12, Lomas de Chapultepec',
    addressReferences: 'Portón negro con caseta de vigilancia privada. Indicar visita a Gómez.',
    notes: 'Rocky sufre de calor en verano; prefiere camas transpirables.',
    createdAt: '2026-09-22T17:45:00Z'
  },
  {
    id: 'cust-003',
    fullName: 'Ana Patricia Fuentes',
    phone: '55 8901 3456',
    email: 'patricia.fuentes@outlook.com',
    petName: 'Canela (Dachshund Salchicha, 2 años)',
    petBreed: 'Dachshund / Salchicha',
    deliveryAddress: 'Av. Coyoacán 1240, Int. 5, Col. Del Valle Centro',
    addressReferences: 'Casa al fondo del pasillo privado, zaguán café.',
    notes: 'Canela ama las camas tipo cueva o iglú para taparse por completo.',
    createdAt: '2026-10-05T10:15:00Z'
  },
  {
    id: 'cust-004',
    fullName: 'Rodrigo Méndez Aranda',
    phone: '55 2345 6789',
    email: 'rodrigo.mendez@empresa.mx',
    petName: 'Bruno & Luna (Pugs hermanos)',
    petBreed: 'Pug',
    deliveryAddress: 'Gabriel Mancera 812, Col. Narvarte Poniente',
    addressReferences: 'Casa con portón blanco eléctrico y timbre metálico.',
    notes: 'Recoge en tienda en su camioneta.',
    createdAt: '2026-10-12T16:00:00Z'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-001',
    folio: 'VTA-2026-0001',
    customerId: 'cust-001',
    customerName: 'Valeria Sánchez Morales',
    customerPhone: '55 4123 9870',
    customerAddress: 'Calle Sonora 189, Depto 402, Col. Condesa',
    petName: 'Milo (Golden Retriever)',
    items: [
      {
        productId: 'prod-002',
        variantId: 'var-002-l',
        productSku: 'DOG-ORTHO-02-L-CHO',
        productName: 'Cama Sofá Ortopédica Memory Foam Lounge',
        size: 'L',
        color: 'Café Chocolate',
        dimensions: '95 x 75 x 22 cm',
        unitPrice: 1890,
        costPrice: 950,
        quantity: 1,
        subtotal: 1890
      }
    ],
    subtotal: 1890,
    discount: 100,
    deliveryFee: 150,
    total: 1940,
    amountPaid: 1940,
    balancePending: 0,
    paymentMethod: 'Tarjeta de Débito/Crédito',
    payments: [
      {
        id: 'pay-001',
        amount: 1940,
        method: 'Tarjeta de Débito/Crédito',
        date: '2026-10-18T15:30:00Z',
        notes: 'Pago con tarjeta en tienda DogZzz',
        registeredBy: 'Mariana López'
      }
    ],
    orderStatus: 'COMPLETADO',
    delivery: {
      required: true,
      status: 'ENTREGADA',
      scheduledDate: '2026-10-19',
      timeSlot: '10:00 - 14:00',
      recipientName: 'Valeria Sánchez Morales',
      recipientPhone: '55 4123 9870',
      address: 'Calle Sonora 189, Depto 402, Col. Condesa',
      references: 'Edificio color verde agua, frente al Parque España.',
      deliveryFee: 150,
      assignedDriver: 'Roberto Díaz (Van DogZzz)',
      deliveredAt: '2026-10-19T11:45:00Z',
      deliveryNotes: 'Entregada en puerta. Milo la estrenó de inmediato moviendo la colita.'
    },
    notes: 'Cliente muy contenta con el Memory Foam.',
    createdBy: 'Mariana López',
    createdAt: '2026-10-18T15:30:00Z',
    updatedAt: '2026-10-19T11:45:00Z',
    timeline: [
      { id: 'evt-1', date: '2026-10-18T15:30:00Z', action: 'Venta registrada', description: 'Venta registrada con folio VTA-2026-0001 en DogZzz', user: 'Mariana López' },
      { id: 'evt-2', date: '2026-10-18T15:35:00Z', action: 'Pago total recibido', description: 'Cobro de $1,940.00 MXN liquidado con Tarjeta', user: 'Mariana López' },
      { id: 'evt-3', date: '2026-10-19T11:45:00Z', action: 'Entrega completada', description: 'Entregada a Valeria Sánchez para su perrito Milo', user: 'Roberto Díaz' }
    ]
  },
  {
    id: 'ord-002',
    folio: 'VTA-2026-0002',
    customerId: 'cust-003',
    customerName: 'Ana Patricia Fuentes',
    customerPhone: '55 8901 3456',
    customerAddress: 'Av. Coyoacán 1240, Int. 5, Col. Del Valle Centro',
    petName: 'Canela (Salchicha)',
    items: [
      {
        productId: 'prod-003',
        variantId: 'var-003-s',
        productSku: 'DOG-CAVE-03-S-SAL',
        productName: 'Cama Cueva Acolchada Madriguera Calientita',
        size: 'S',
        color: 'Verde Salvia',
        dimensions: '55 x 55 x 35 cm',
        unitPrice: 750,
        costPrice: 380,
        quantity: 1,
        subtotal: 750
      }
    ],
    subtotal: 750,
    discount: 0,
    deliveryFee: 150,
    total: 900,
    amountPaid: 500,
    balancePending: 400, // Saldo pendiente
    paymentMethod: 'Transferencia Bancaria',
    payments: [
      {
        id: 'pay-002',
        amount: 500,
        method: 'Transferencia Bancaria',
        date: '2026-10-22T11:00:00Z',
        notes: 'Anticipo por SPEI para apartar cama cueva',
        registeredBy: 'Carlos Mendoza'
      }
    ],
    orderStatus: 'CONFIRMADO',
    delivery: {
      required: true,
      status: 'PROGRAMADA',
      scheduledDate: '2026-10-24', // Hoy
      timeSlot: '14:00 - 18:00',
      recipientName: 'Ana Patricia Fuentes',
      recipientPhone: '55 8901 3456',
      address: 'Av. Coyoacán 1240, Int. 5, Col. Del Valle Centro',
      references: 'Casa al fondo del pasillo privado, zaguán café.',
      deliveryFee: 150,
      assignedDriver: 'Roberto Díaz (Van DogZzz)',
      deliveryNotes: 'Cobrar saldo restante de $400 en efectivo contra entrega.'
    },
    notes: 'Llevar cambio de $100 por si paga con billete de $500.',
    createdBy: 'Carlos Mendoza',
    createdAt: '2026-10-22T11:00:00Z',
    updatedAt: '2026-10-23T10:00:00Z',
    timeline: [
      { id: 'evt-21', date: '2026-10-22T11:00:00Z', action: 'Venta registrada', description: 'Folio VTA-2026-0002 registrado', user: 'Carlos Mendoza' },
      { id: 'evt-22', date: '2026-10-22T11:05:00Z', action: 'Anticipo recibido', description: 'Anticipo de $500.00 MXN vía SPEI', user: 'Carlos Mendoza' },
      { id: 'evt-23', date: '2026-10-23T10:00:00Z', action: 'Entrega programada', description: 'Programada para entrega hoy en la tarde', user: 'Roberto Díaz' }
    ]
  },
  {
    id: 'ord-003',
    folio: 'VTA-2026-0003',
    customerId: 'cust-004',
    customerName: 'Rodrigo Méndez Aranda',
    customerPhone: '55 2345 6789',
    customerAddress: 'Gabriel Mancera 812, Col. Narvarte Poniente',
    petName: 'Bruno & Luna (Pugs)',
    items: [
      {
        productId: 'prod-001',
        variantId: 'var-001-m',
        productSku: 'DOG-DONUT-01-M-BEI',
        productName: 'Cama Dona Felpa Relajante Anti-Ansiedad',
        size: 'M',
        color: 'Beige Arena',
        dimensions: '80 cm diámetro',
        unitPrice: 890,
        costPrice: 420,
        quantity: 2,
        subtotal: 1780
      }
    ],
    subtotal: 1780,
    discount: 100,
    deliveryFee: 0, // Recoge en tienda DogZzz
    total: 1680,
    amountPaid: 1680,
    balancePending: 0,
    paymentMethod: 'Efectivo',
    payments: [
      {
        id: 'pay-003',
        amount: 1680,
        method: 'Efectivo',
        date: '2026-10-23T16:30:00Z',
        notes: 'Pago completo de contado en caja DogZzz',
        registeredBy: 'Mariana López'
      }
    ],
    orderStatus: 'LISTO_RECOGER',
    delivery: {
      required: false,
      status: 'SIN_PROGRAMAR',
      recipientName: 'Rodrigo Méndez Aranda',
      recipientPhone: '55 2345 6789',
      address: 'Mostrador Tienda DogZzz',
      references: 'Presentar ticket o dar nombre del cliente',
      deliveryFee: 0,
      deliveryNotes: 'Camas donas empacadas en bolsa ecológica DogZzz.'
    },
    notes: 'El cliente vendrá con Bruno y Luna a la tienda.',
    createdBy: 'Mariana López',
    createdAt: '2026-10-23T16:30:00Z',
    updatedAt: '2026-10-23T17:00:00Z',
    timeline: [
      { id: 'evt-31', date: '2026-10-23T16:30:00Z', action: 'Venta registrada', description: 'Folio VTA-2026-0003 en mostrador', user: 'Mariana López' },
      { id: 'evt-32', date: '2026-10-23T16:35:00Z', action: 'Pago en efectivo', description: 'Pago de $1,680.00 MXN en caja', user: 'Mariana López' },
      { id: 'evt-33', date: '2026-10-23T17:00:00Z', action: 'Listo para retiro', description: 'Separadas y listas en bodega de tienda', user: 'Carlos Mendoza' }
    ]
  }
];

export const INITIAL_MOVEMENTS: InventoryMovement[] = [
  {
    id: 'mov-001',
    productId: 'prod-001',
    variantId: 'var-001-m',
    productSku: 'DOG-DONUT-01-M-BEI',
    productName: 'Cama Dona Felpa Relajante Anti-Ansiedad',
    variantInfo: 'Talla M · Beige Arena',
    type: 'IN_PURCHASE',
    quantity: 10,
    previousStock: 0,
    newStock: 10,
    reason: 'Recepción de lote inicial fábrica DogZzz',
    registeredBy: 'Carlos Mendoza',
    createdAt: '2026-09-01T10:00:00Z'
  },
  {
    id: 'mov-002',
    productId: 'prod-002',
    variantId: 'var-002-l',
    productSku: 'DOG-ORTHO-02-L-CHO',
    productName: 'Cama Sofá Ortopédica Memory Foam Lounge',
    variantInfo: 'Talla L · Café Chocolate',
    type: 'OUT_SALE',
    quantity: -1,
    previousStock: 4,
    newStock: 3,
    reason: 'Venta confirmada Folio VTA-2026-0001',
    orderFolio: 'VTA-2026-0001',
    registeredBy: 'Mariana López',
    createdAt: '2026-10-18T15:30:00Z'
  },
  {
    id: 'mov-003',
    productId: 'prod-003',
    variantId: 'var-003-s',
    productSku: 'DOG-CAVE-03-S-SAL',
    productName: 'Cama Cueva Acolchada Madriguera Calientita',
    variantInfo: 'Talla S · Verde Salvia',
    type: 'OUT_SALE',
    quantity: -1,
    previousStock: 4,
    newStock: 3,
    reason: 'Venta confirmada Folio VTA-2026-0002',
    orderFolio: 'VTA-2026-0002',
    registeredBy: 'Carlos Mendoza',
    createdAt: '2026-10-22T11:00:00Z'
  },
  {
    id: 'mov-004',
    productId: 'prod-001',
    variantId: 'var-001-m',
    productSku: 'DOG-DONUT-01-M-BEI',
    productName: 'Cama Dona Felpa Relajante Anti-Ansiedad',
    variantInfo: 'Talla M · Beige Arena',
    type: 'OUT_SALE',
    quantity: -2,
    previousStock: 7,
    newStock: 5,
    reason: 'Venta confirmada Folio VTA-2026-0003',
    orderFolio: 'VTA-2026-0003',
    registeredBy: 'Mariana López',
    createdAt: '2026-10-23T16:30:00Z'
  }
];
