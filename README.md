# ButterChoice

Compara y elige la mejor mantequilla en los supermercados de España.

Datos reales de nutrición, ingredientes e imágenes desde [Open Food Facts](https://world.openfoodfacts.org/). Scoring multi-criterio: calidad, valor y nutrición.

## Pantallas

| Ruta | Descripción |
|------|-------------|
| `/` | Home — top mantequillas, categorías, supermercados |
| `/butters` | Listado con filtros por categoría, supermercado, tipo de leche |
| `/butters/[slug]` | Ficha completa: ingredientes, nutrición, comparativa de precios |
| `/compare` | Comparador lado a lado de 2-4 mantequillas |
| `/supermarkets` | Listado de supermercados |
| `/supermarkets/[slug]` | Mantequillas disponibles en cada supermercado |
| `/ranking` | Rankings por calidad, valor, nutrición |

## Scoring

| Criterio | Peso | Factores |
|----------|------|----------|
| Calidad | 40% | Pureza de ingredientes, % grasa, D.O., ecológica, tipo de leche |
| Valor | 35% | Precio/100g vs media de categoría |
| Nutrición | 25% | Ratio grasa saturada, trans fats, colesterol, sodio |

## Tech Stack

- **Next.js 15** (App Router, Server Components)
- **Neon** (serverless Postgres)
- **Drizzle ORM** (schema, migrations, queries)
- **Tailwind CSS v4** + **shadcn/ui**
- **Open Food Facts API** (datos de producto reales)

## Setup

```bash
# 1. Clonar e instalar
git clone https://github.com/jorgesanz6/butter.git
cd butter
npm install

# 2. Crear .env.local con DATABASE_URL de Neon
echo "DATABASE_URL=postgresql://..." > .env.local

# 3. Migraciones y seed
npx drizzle-kit generate
npx drizzle-kit migrate
npx tsx src/lib/db/seed.ts

# 4. Importar datos reales desde Open Food Facts
DATABASE_URL="postgresql://..." npx tsx src/scripts/import-off.ts
DATABASE_URL="postgresql://..." npx tsx src/scripts/import-off-search.ts

# 5. Desarrollo
npm run dev
```

## Importar datos desde Open Food Facts

El script `import-off.ts` usa códigos de barras EAN-13 verificados para actualizar nutrición, imágenes, ingredientes y alérgenos desde OFF:

```bash
DATABASE_URL="postgresql://..." npx tsx src/scripts/import-off.ts
```

El script `import-off-search.ts` busca productos por nombre cuando no hay barcode conocido, y solo actualiza campos vacíos:

```bash
DATABASE_URL="postgresql://..." npx tsx src/scripts/import-off-search.ts
```

## Deploy en Vercel

1. Conectar repo en [vercel.com](https://vercel.com)
2. Añadir `DATABASE_URL` como environment variable
3. Ejecutar migraciones y seed antes del primer deploy
4. Deploy automático en cada push a `main`

## Base de datos

Esquema principal:

- `butters` — datos de producto, nutrición, scoring
- `brands` — marcas (Central Lechera Asturiana, Lurpak, Président...)
- `butter_categories` — sin sal, salada, semisalada, ghee, untable, ecológica
- `supermarkets` — Mercadona, Carrefour, Día, Lidl, Aldi, Eroski, Consum, Alcampo, El Corte Inglés, Hipercor
- `butter_supermarkets` — precios y disponibilidad por supermercado
- `denominations` — denominaciones de origen

## Licencia

MIT