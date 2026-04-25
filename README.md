# ButterChoice 🧈

Encuentra la mejor mantequilla en los supermercados de España.

## Setup

### 1. Crear base de datos en Neon

1. Ir a [neon.tech](https://neon.tech) y crear un proyecto
2. Copiar la `DATABASE_URL` del dashboard

### 2. Configurar variables de entorno

```bash
# Editar .env.local con tu DATABASE_URL
```

### 3. Generar migraciones y aplicar

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

### 4. Seed de datos iniciales

```bash
npx tsx src/lib/db/seed.ts
```

### 5. Ejecutar en desarrollo

```bash
npm run dev
```

## Deploy en Vercel

1. Conectar repo en [vercel.com](https://vercel.com)
2. Añadir `DATABASE_URL` como environment variable
3. Ejecutar migraciones y seed antes del primer deploy
4. Deploy automático en cada push

## Estructura

- `/` — Home con top mantequillas y accesos directos
- `/butters` — Listado con filtros
- `/butters/[slug]` — Ficha completa de cada mantequilla
- `/compare` — Comparador de 2-4 mantequillas
- `/supermarkets` — Listado de supermercados
- `/supermarkets/[slug]` — Mantequillas por supermercado
- `/ranking` — Rankings por criterio

## Scoring

- **Calidad (40%)**: Pureza ingredientes, % grasa, D.O., ecológica
- **Valor (35%)**: Precio/100g vs media de categoría
- **Nutrición (25%)**: Ratio grasa saturada, trans, colesterol, sodio