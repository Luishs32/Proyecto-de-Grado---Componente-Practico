-- ══════════════════════════════════════════════════════════
--  RetailOpt — Esquema de Base de Datos Supabase
--  Proyecto de Grado · UNAD · Ingeniería de Sistemas · 2026
-- ══════════════════════════════════════════════════════════

-- ── 1. TIENDAS ────────────────────────────────────────────
CREATE TABLE tiendas (
  id         SERIAL PRIMARY KEY,
  nombre     TEXT NOT NULL,
  ciudad     TEXT DEFAULT 'Pereira',
  estado     TEXT DEFAULT 'Activa',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── 2. PRODUCTOS ──────────────────────────────────────────
CREATE TABLE productos (
  id         SERIAL PRIMARY KEY,
  nombre     TEXT NOT NULL,
  categoria  TEXT,
  proveedor  TEXT,
  precio     NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── 3. GÓNDOLA ────────────────────────────────────────────
-- Capacidad de Exhibición = caras × niveles × profundidad
CREATE TABLE gondola (
  id          SERIAL PRIMARY KEY,
  tienda_id   INTEGER REFERENCES tiendas(id)   ON DELETE CASCADE,
  producto_id INTEGER REFERENCES productos(id) ON DELETE CASCADE,
  caras       INTEGER DEFAULT 1 CHECK (caras      >= 1),
  niveles     INTEGER DEFAULT 1 CHECK (niveles    >= 1),
  profundidad INTEGER DEFAULT 1 CHECK (profundidad >= 1),
  UNIQUE (tienda_id, producto_id)
);

-- ── 4. INVENTARIO ─────────────────────────────────────────
CREATE TABLE inventario (
  id             SERIAL PRIMARY KEY,
  tienda_id      INTEGER REFERENCES tiendas(id)   ON DELETE CASCADE,
  producto_id    INTEGER REFERENCES productos(id) ON DELETE CASCADE,
  stock_actual   INTEGER DEFAULT 0 CHECK (stock_actual >= 0),
  ventas_diarias INTEGER[] DEFAULT ARRAY[0,0,0,0,0,0,0],
  updated_at     TIMESTAMPTZ DEFAULT now(),
  UNIQUE (tienda_id, producto_id)
);

-- ── 5. SEGURIDAD POR FILAS (RLS) ──────────────────────────
ALTER TABLE tiendas    ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos  ENABLE ROW LEVEL SECURITY;
ALTER TABLE gondola    ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventario ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso público (prototipo — sin autenticación)
CREATE POLICY "acceso_publico" ON tiendas    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "acceso_publico" ON productos  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "acceso_publico" ON gondola    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "acceso_publico" ON inventario FOR ALL USING (true) WITH CHECK (true);

-- ── 6. DATOS INICIALES (SEED) ─────────────────────────────

-- Tiendas
INSERT INTO tiendas (nombre, ciudad, estado) VALUES
  ('Tienda Centro',  'Pereira', 'Activa'),
  ('Tienda Pinares', 'Pereira', 'Activa'),
  ('Tienda Cuba',    'Pereira', 'Activa');

-- Productos
INSERT INTO productos (nombre, categoria, proveedor, precio) VALUES
  ('Leche Entera 1L',       'Lácteos',     'Alquería',  3200),
  ('Arroz Diana 500g',       'Granos',      'Diana',     2100),
  ('Aceite Girasol 1L',      'Aceites',     'La Espiga', 12500),
  ('Pan Tajado 500g',        'Panadería',   'Bimbo',     4800),
  ('Detergente Ariel 1kg',   'Aseo',        'P&G',       15900),
  ('Café Juan Valdez 250g',  'Bebidas',     'FNC',       18500),
  ('Azúcar x1kg',            'Básicos',     'Manuelita', 3500),
  ('Salsa de Tomate 400g',   'Condimentos', 'Fruco',     6200);

-- Góndola (tienda_id, producto_id, caras, niveles, profundidad)
INSERT INTO gondola (tienda_id, producto_id, caras, niveles, profundidad) VALUES
  (1,1,4,3,2),(1,2,6,2,3),(1,3,3,2,2),(1,4,5,1,1),
  (1,5,4,2,2),(1,6,3,3,2),(1,7,5,2,4),(1,8,4,2,3),
  (2,1,3,2,2),(2,2,5,2,2),(2,3,2,2,2),(2,4,4,1,1),
  (2,5,3,2,2),(2,6,2,3,2),(2,7,4,2,3),(2,8,3,2,2),
  (3,1,5,3,3),(3,2,7,2,4),(3,3,4,2,2),(3,4,6,1,2),
  (3,5,5,2,3),(3,6,4,3,2),(3,7,6,2,5),(3,8,5,2,3);

-- Inventario (tienda_id, producto_id, stock_actual, ventas_diarias)
INSERT INTO inventario (tienda_id, producto_id, stock_actual, ventas_diarias) VALUES
  (1,1,8, ARRAY[18,20,15,22,19,17,21]),
  (1,2,25,ARRAY[12,14,11,15,13,12,14]),
  (1,3,3, ARRAY[6,8,7,9,6,7,8]),
  (1,4,2, ARRAY[8,10,9,11,8,9,10]),
  (1,5,12,ARRAY[4,5,3,6,4,5,4]),
  (1,6,15,ARRAY[5,6,4,7,5,6,5]),
  (1,7,45,ARRAY[20,22,18,25,21,19,23]),
  (1,8,10,ARRAY[7,9,8,10,7,8,9]),
  (2,1,5, ARRAY[14,16,13,17,15,14,16]),
  (2,2,18,ARRAY[10,11,9,12,10,11,10]),
  (2,3,2, ARRAY[4,5,4,6,4,5,4]),
  (2,4,0, ARRAY[6,7,6,8,6,7,7]),   -- ← Quiebre intencional
  (2,5,8, ARRAY[3,4,3,4,3,4,3]),
  (2,6,11,ARRAY[3,4,3,5,3,4,3]),
  (2,7,30,ARRAY[15,17,14,18,16,15,17]),
  (2,8,6, ARRAY[5,6,5,7,5,6,6]),
  (3,1,12,ARRAY[22,24,20,26,23,21,25]),
  (3,2,40,ARRAY[18,20,16,22,19,18,20]),
  (3,3,7, ARRAY[8,10,9,11,8,9,10]),
  (3,4,4, ARRAY[12,14,11,15,12,13,14]),
  (3,5,20,ARRAY[6,7,6,8,6,7,7]),
  (3,6,18,ARRAY[7,8,6,9,7,8,7]),
  (3,7,65,ARRAY[30,32,28,35,31,29,33]),
  (3,8,15,ARRAY[9,11,10,12,9,10,11]);
