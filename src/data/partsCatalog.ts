export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock'

export interface CatalogPart {
  id: string
  partNumber: string
  name: string
  description: string
  supplier: string
  unitCost: number
  stockLevel: number
  stockStatus: StockStatus
  compatibility: string[]
  leadTimeDays?: number
}

export interface Subcategory {
  id: string
  name: string
  parts: CatalogPart[]
}

export interface Category {
  id: string
  name: string
  subcategories: Subcategory[]
}

export const partsCatalog: Category[] = [
  {
    id: 'cat-engine',
    name: 'Engine & Drivetrain',
    subcategories: [
      {
        id: 'sub-filters',
        name: 'Filters',
        parts: [
          {
            id: 'cp-001',
            partNumber: 'BMW-11-42-8-575-211',
            name: 'Engine Oil Filter',
            description: 'OEM paper oil filter element for N20/N26/N52/N55 engines. Replaces at every oil service interval.',
            supplier: 'MANN-Filter',
            unitCost: 18.90,
            stockLevel: 42,
            stockStatus: 'in_stock',
            compatibility: ['BMW 1 Series', 'BMW 3 Series', 'BMW 5 Series', 'BMW X3'],
          },
          {
            id: 'cp-002',
            partNumber: 'AUDI-06H-115-562-C',
            name: 'Engine Oil Filter Kit',
            description: 'Complete filter kit including drain plug seal for EA888 Gen3 engines.',
            supplier: 'Mahle',
            unitCost: 14.50,
            stockLevel: 28,
            stockStatus: 'in_stock',
            compatibility: ['Audi A3', 'Audi A4', 'Audi Q5', 'VW Golf', 'VW Passat', 'Skoda Octavia'],
          },
          {
            id: 'cp-003',
            partNumber: 'MB-A2760940004',
            name: 'Air Filter Element',
            description: 'High-flow paper air filter for M274 and M276 engine families.',
            supplier: 'Knecht/Mahle',
            unitCost: 31.20,
            stockLevel: 15,
            stockStatus: 'low_stock',
            compatibility: ['Mercedes-Benz C-Class', 'Mercedes-Benz E-Class', 'Mercedes-Benz GLC'],
          },
          {
            id: 'cp-004',
            partNumber: 'BMW-64-31-9-272-645',
            name: 'Cabin Air Filter (Pollen)',
            description: 'Activated carbon cabin filter. Filters particulates and absorbs odours.',
            supplier: 'MANN-Filter',
            unitCost: 32.50,
            stockLevel: 35,
            stockStatus: 'in_stock',
            compatibility: ['BMW 3 Series', 'BMW 4 Series', 'BMW X3', 'BMW X4'],
          },
        ],
      },
      {
        id: 'sub-oils',
        name: 'Engine Oils & Fluids',
        parts: [
          {
            id: 'cp-005',
            partNumber: 'BMW-OIL-LL04-5L',
            name: 'Longlife-04 5W-30 Engine Oil (5L)',
            description: 'BMW approved fully synthetic engine oil. Required for DPF-equipped diesel models and many petrol engines.',
            supplier: 'Castrol',
            unitCost: 54.00,
            stockLevel: 60,
            stockStatus: 'in_stock',
            compatibility: ['BMW (all petrol/diesel with DPF)'],
          },
          {
            id: 'cp-006',
            partNumber: 'VW-G-052-182-A2',
            name: 'DSG Transmission Fluid 6-speed (1L)',
            description: 'Factory-fill DSG6 gearbox fluid. Required for DQ250 mechatronic service.',
            supplier: 'Pentosin',
            unitCost: 38.50,
            stockLevel: 8,
            stockStatus: 'low_stock',
            compatibility: ['VW Golf GTI', 'VW Tiguan', 'Audi A3', 'Skoda Octavia RS'],
          },
          {
            id: 'cp-007',
            partNumber: 'MB-BRAKE-DOT4-1L',
            name: 'Brake Fluid DOT 4 (1L)',
            description: 'High-boiling point DOT4 fluid. Recommended replacement every 2 years.',
            supplier: 'ATE',
            unitCost: 11.90,
            stockLevel: 0,
            stockStatus: 'out_of_stock',
            compatibility: ['Universal'],
            leadTimeDays: 3,
          },
        ],
      },
      {
        id: 'sub-timing',
        name: 'Timing & Belt Components',
        parts: [
          {
            id: 'cp-008',
            partNumber: 'VW-03L-198-119-A',
            name: 'Timing Belt Kit',
            description: 'Complete kit: belt, tensioner, idler roller, water pump for TDI 2.0L engines.',
            supplier: 'INA / Schaeffler',
            unitCost: 189.00,
            stockLevel: 6,
            stockStatus: 'low_stock',
            compatibility: ['VW Passat TDI', 'Audi A4 TDI', 'Audi A6 TDI', 'Skoda Superb TDI'],
          },
          {
            id: 'cp-009',
            partNumber: 'BMW-11-31-7-519-464',
            name: 'Timing Chain Kit (N47)',
            description: 'Full timing chain replacement kit including guides, tensioner, and sprockets for N47 diesel.',
            supplier: 'Iwis',
            unitCost: 340.00,
            stockLevel: 4,
            stockStatus: 'low_stock',
            compatibility: ['BMW 1 Series 118d/120d', 'BMW 3 Series 318d/320d', 'BMW X1 18d/20d'],
          },
        ],
      },
    ],
  },
  {
    id: 'cat-brakes',
    name: 'Braking System',
    subcategories: [
      {
        id: 'sub-pads-discs',
        name: 'Brake Pads & Discs',
        parts: [
          {
            id: 'cp-010',
            partNumber: 'POR-95B-615-601-H',
            name: 'Front Brake Disc (Vented)',
            description: 'OEM-spec vented front disc. 350mm diameter for Cayenne base. Replace in axle pairs.',
            supplier: 'Brembo',
            unitCost: 128.00,
            stockLevel: 12,
            stockStatus: 'in_stock',
            compatibility: ['Porsche Cayenne (9YA)', 'Porsche Cayenne S (9YA)'],
          },
          {
            id: 'cp-011',
            partNumber: 'BMW-34-11-6-797-859',
            name: 'Front Brake Pad Set',
            description: 'Low-dust ceramic compound. Includes pad wear sensors. For F30/F31/F34.',
            supplier: 'Textar',
            unitCost: 64.90,
            stockLevel: 22,
            stockStatus: 'in_stock',
            compatibility: ['BMW 3 Series (F30)', 'BMW 4 Series (F32)', 'BMW 4 Series Gran Coupe'],
          },
          {
            id: 'cp-012',
            partNumber: 'AUDI-8K0-615-601-J',
            name: 'Rear Brake Disc (Solid)',
            description: '300mm solid rear disc for Audi B8/B8.5 platform.',
            supplier: 'Zimmermann',
            unitCost: 74.50,
            stockLevel: 0,
            stockStatus: 'out_of_stock',
            compatibility: ['Audi A4 (B8/B8.5)', 'Audi A5 (8T)', 'Audi Q5 (8R)'],
            leadTimeDays: 5,
          },
        ],
      },
      {
        id: 'sub-calipers',
        name: 'Calipers & Hardware',
        parts: [
          {
            id: 'cp-013',
            partNumber: 'VW-1K0-615-424-H',
            name: 'Rear Brake Caliper (Right)',
            description: 'Reman caliper with integrated handbrake mechanism for MQB platform.',
            supplier: 'TRW',
            unitCost: 98.00,
            stockLevel: 5,
            stockStatus: 'low_stock',
            compatibility: ['VW Golf Mk7', 'VW Tiguan AD1', 'Audi A3 (8V)', 'Seat Leon Mk3'],
          },
        ],
      },
    ],
  },
  {
    id: 'cat-suspension',
    name: 'Suspension & Steering',
    subcategories: [
      {
        id: 'sub-shocks',
        name: 'Shock Absorbers & Springs',
        parts: [
          {
            id: 'cp-014',
            partNumber: 'POR-95B-616-001-H',
            name: 'Air Spring – Rear Right',
            description: 'OEM air spring bladder for Cayenne air suspension. Compatible with standard and active suspension.',
            supplier: 'Continental / VDO',
            unitCost: 485.00,
            stockLevel: 2,
            stockStatus: 'low_stock',
            compatibility: ['Porsche Cayenne (9YA)', 'Porsche Cayenne E-Hybrid'],
          },
          {
            id: 'cp-015',
            partNumber: 'BMW-31-31-6-785-585',
            name: 'Front Shock Absorber (Left)',
            description: 'OEM-equivalent monotube shock for F30 standard suspension (non-EDC).',
            supplier: 'Sachs / ZF',
            unitCost: 142.00,
            stockLevel: 9,
            stockStatus: 'in_stock',
            compatibility: ['BMW 3 Series (F30)', 'BMW 3 Series GT (F34)'],
          },
        ],
      },
      {
        id: 'sub-steering',
        name: 'Steering Components',
        parts: [
          {
            id: 'cp-016',
            partNumber: 'MB-2054601800',
            name: 'Tie Rod End (Left)',
            description: 'Outer tie rod end. Replace in pairs when free play exceeds 1mm.',
            supplier: 'Lemförder / ZF',
            unitCost: 38.00,
            stockLevel: 18,
            stockStatus: 'in_stock',
            compatibility: ['Mercedes-Benz C-Class (W205)', 'Mercedes-Benz GLC (X253)'],
          },
        ],
      },
    ],
  },
  {
    id: 'cat-electrical',
    name: 'Electrical & Sensors',
    subcategories: [
      {
        id: 'sub-sensors',
        name: 'Sensors',
        parts: [
          {
            id: 'cp-017',
            partNumber: 'AUDI-06H-906-051-A',
            name: 'Boost Pressure Sensor',
            description: 'MAP sensor for EA888 turbocharged engines. Fault code P0299 typically indicates failure.',
            supplier: 'Bosch',
            unitCost: 78.90,
            stockLevel: 14,
            stockStatus: 'in_stock',
            compatibility: ['Audi A3', 'Audi A4', 'Audi TT', 'VW Golf GTI', 'VW Golf R', 'Seat Leon Cupra'],
          },
          {
            id: 'cp-018',
            partNumber: 'BMW-13-62-7-843-531',
            name: 'Mass Airflow Sensor (MAF)',
            description: 'Hot-film MAF for N43/N53 naturally aspirated engines. Affects idle quality and fuelling.',
            supplier: 'Bosch',
            unitCost: 112.00,
            stockLevel: 7,
            stockStatus: 'in_stock',
            compatibility: ['BMW 1 Series (E81/E87)', 'BMW 3 Series (E90/E91)', 'BMW Z4 (E89)'],
          },
        ],
      },
      {
        id: 'sub-batteries',
        name: 'Batteries & Starting',
        parts: [
          {
            id: 'cp-019',
            partNumber: 'BOSCH-S5-A08-95AH',
            name: 'AGM Battery 95Ah',
            description: '12V AGM battery for vehicles with Start/Stop systems. Must be coded to ECU after replacement.',
            supplier: 'Bosch',
            unitCost: 189.00,
            stockLevel: 10,
            stockStatus: 'in_stock',
            compatibility: ['BMW 5 Series (F10)', 'Audi A6 (C7)', 'Mercedes-Benz E-Class (W212)', 'VW Passat B8'],
          },
          {
            id: 'cp-020',
            partNumber: 'POR-955-616-014-00',
            name: 'Air Suspension Compressor Relay',
            description: 'Relay for air suspension compressor. Failure causes compressor to run continuously or not at all.',
            supplier: 'Hella',
            unitCost: 42.00,
            stockLevel: 6,
            stockStatus: 'in_stock',
            compatibility: ['Porsche Cayenne (9PA/92A/9YA)', 'Audi Q7 (4L)', 'VW Touareg (7L/7P)'],
          },
        ],
      },
    ],
  },
]

export function getAllParts(catalog: Category[]): CatalogPart[] {
  return catalog.flatMap(cat => cat.subcategories.flatMap(sub => sub.parts))
}

export function findSubcategory(catalog: Category[], subId: string): Subcategory | undefined {
  for (const cat of catalog) {
    const sub = cat.subcategories.find(s => s.id === subId)
    if (sub) return sub
  }
  return undefined
}

export function findPartByNumber(
  catalog: Category[],
  partNumber: string,
): { part: CatalogPart; subcategoryId: string; categoryId: string } | null {
  for (const cat of catalog) {
    for (const sub of cat.subcategories) {
      const part = sub.parts.find(p => p.partNumber === partNumber)
      if (part) return { part, subcategoryId: sub.id, categoryId: cat.id }
    }
  }
  return null
}
