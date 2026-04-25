import { db } from "@/lib/db";
import { brands, butterCategories, butters, denominations, supermarkets, butterSupermarkets } from "@/lib/db/schema";

async function seed() {
  console.log("Seeding database...");

  // --- Categories ---
  const categoryRows = await db.insert(butterCategories).values([
    { name: "Mantequilla sin sal", slug: "sin-sal" },
    { name: "Mantequilla salada", slug: "salada" },
    { name: "Mantequilla semisalada", slug: "semisalada" },
    { name: "Mantequilla clarificada (Ghee)", slug: "ghee" },
    { name: "Mantequilla untable", slug: "untable" },
    { name: "Mantequilla ecológica", slug: "ecologica" },
  ]).returning();

  // --- Brands ---
  const brandRows = await db.insert(brands).values([
    { name: "Central Lechera Asturiana", slug: "central-lechera-asturiana", country: "España", description: "Cooperativa asturiana, lácteos de referencia en España." },
    { name: "Lurpak", slug: "lurpak", country: "Dinamarca", description: "Marca danesa de Arla Foods, muy popular en España." },
    { name: "Flora", slug: "flora", country: "Reino Unido", description: "Marca de Upfield, untables de calidad." },
    { name: "Tulipán", slug: "tulipan", country: "España", description: "Marca histórica de mantequilla untable en España." },
    { name: "Président", slug: "president", country: "Francia", description: "Marca francesa de Lactalis." },
    { name: "Kerrygold", slug: "kerrygold", country: "Irlanda", description: "Mantequilla irlandesa de vacas alimentadas con hierba." },
    { name: "Mantequerías Arias", slug: "mantequerias-arias", country: "España", description: "Marca española tradicional con sede en Madrid." },
    { name: "Hacendado", slug: "hacendado", country: "España", description: "Marca blanca de Mercadona." },
    { name: "Carrefour", slug: "carrefour-brand", country: "Francia", description: "Marca blanca de Carrefour." },
    { name: "Dia", slug: "dia-brand", country: "España", description: "Marca blanca de Dia." },
    { name: "Eroski", slug: "eroski-brand", country: "España", description: "Marca blanca de Eroski/Consum." },
    { name: "Auchan", slug: "auchan-brand", country: "Francia", description: "Marca blanca de Alcampo/Auchan." },
    { name: "Lidl (Milbona)", slug: "milbona-lidl", country: "Alemania", description: "Marca Milbona de Lidl." },
    { name: "Aldi (Corale)", slug: "corale-aldi", country: "Alemania", description: "Marca Corale de Aldi." },
    { name: "El Corte Inglés", slug: "el-corte-ingles-brand", country: "España", description: "Marca blanca especial de El Corte Inglés." },
    { name: "Becel", slug: "becel", country: "Países Bajos", description: "Marca de Upfield, enfocada en salud cardiovascular." },
    { name: "Bertolli", slug: "bertolli", country: "Italia", description: "Marca italiana especializada en untables con aceite de oliva." },
  ]).returning();

  // --- Supermarkets ---
  const supermarketRows = await db.insert(supermarkets).values([
    { name: "Mercadona", slug: "mercadona", type: "supermercado" },
    { name: "Carrefour", slug: "carrefour", type: "hipermercado" },
    { name: "Dia", slug: "dia", type: "descuento" },
    { name: "Lidl", slug: "lidl", type: "descuento" },
    { name: "Aldi", slug: "aldi", type: "descuento" },
    { name: "Eroski", slug: "eroski", type: "supermercado" },
    { name: "Consum", slug: "consum", type: "supermercado" },
    { name: "Alcampo", slug: "alcampo", type: "hipermercado" },
    { name: "El Corte Inglés", slug: "el-corte-ingles", type: "especializado" },
    { name: "Hipercor", slug: "hipercor", type: "hipermercado" },
  ]).returning();

  // --- Denominations ---
  const denominationRows = await db.insert(denominations).values([
    { name: "Mantequilla de Asturias", slug: "mantequilla-asturias", region: "Asturias", description: "Mantequilla artesanal elaborada con leche de vacas asturianas." },
  ]).returning();

  // Helpers
  const b = (slug: string) => brandRows.find(x => x.slug === slug)!.id;
  const c = (slug: string) => categoryRows.find(x => x.slug === slug)!.id;
  const s = (slug: string) => supermarketRows.find(x => x.slug === slug)!.id;

  // --- Butters (more realistic data) ---
  const butterRows = await db.insert(butters).values([
    // === MERCADONA EXCLUSIVES / MAIN ===
    { name: "Hacendado Mantequilla Sin Sal", slug: "hacendado-sin-sal", brandId: b("hacendado"), categoryId: c("sin-sal"), fatPercentage: "82", saltPercentage: "0", waterPercentage: "16", milkType: "vaca", isOrganic: false, isClarified: false, isSpreadable: false, color: "amarillo pálido", ingredients: ["nata de vaca pasteurizada"], additives: [], allergens: ["leche"], caloriesKcal: "742", totalFatG: "82", saturatedFatG: "54", transFatG: "2.5", cholesterolMg: "220", sodiumMg: "10", proteinG: "0.5", carbsG: "0.5", weightG: 250, format: "barra", packagingType: "papel", qualityScore: "7.5", valueScore: "8.5", nutritionScore: "6.5", overallScore: "7.5", description: "Mantequilla sin sal de Mercadona. Buena calidad a precio contenido." },
    { name: "Hacendado Mantequilla Salada", slug: "hacendado-salada", brandId: b("hacendado"), categoryId: c("salada"), fatPercentage: "80", saltPercentage: "1.5", waterPercentage: "16", milkType: "vaca", isOrganic: false, isClarified: false, isSpreadable: false, color: "amarillo pálido", ingredients: ["nata de vaca pasteurizada", "sal"], additives: [], allergens: ["leche"], caloriesKcal: "730", totalFatG: "80", saturatedFatG: "52", transFatG: "2.5", cholesterolMg: "215", sodiumMg: "900", proteinG: "0.5", carbsG: "0.5", weightG: 250, format: "barra", packagingType: "papel", qualityScore: "7.3", valueScore: "8.5", nutritionScore: "5.5", overallScore: "7.1", description: "Mantequilla salada de Mercadona." },
    { name: "Hacendado Mantequilla Untable", slug: "hacendado-untable", brandId: b("hacendado"), categoryId: c("untable"), fatPercentage: "65", saltPercentage: "0.8", waterPercentage: "30", milkType: "vaca", isOrganic: false, isClarified: false, isSpreadable: true, color: "amarillo claro", ingredients: ["nata de vaca pasteurizada", "aceite de girasol", "aceite de colza", "sal", "emulsionante (lecitina de girasol)"], additives: ["lecitina de girasol"], allergens: ["leche"], caloriesKcal: "585", totalFatG: "65", saturatedFatG: "24", transFatG: "0.8", cholesterolMg: "90", sodiumMg: "550", proteinG: "0.3", carbsG: "0.8", weightG: 400, format: "tarrina", packagingType: "tapa_plastico", qualityScore: "5.8", valueScore: "8.0", nutritionScore: "6.5", overallScore: "6.8", description: "Untable de Mercadona. Se unte directamente del frigorífico." },

    // === CENTRAL LECHERA ASTURIANA ===
    { name: "Central Lechera Asturiana Sin Sal", slug: "cla-sin-sal", brandId: b("central-lechera-asturiana"), categoryId: c("sin-sal"), denominationId: denominationRows[0]?.id, fatPercentage: "82", saltPercentage: "0", waterPercentage: "16", milkType: "vaca", isOrganic: false, isClarified: false, isSpreadable: false, color: "amarillo pálido", ingredients: ["nata de vaca pasteurizada"], additives: [], allergens: ["leche"], caloriesKcal: "742", totalFatG: "82", saturatedFatG: "54", transFatG: "2.5", cholesterolMg: "220", sodiumMg: "10", proteinG: "0.5", carbsG: "0.5", weightG: 250, format: "barra", packagingType: "papel", qualityScore: "8.5", valueScore: "7.2", nutritionScore: "6.8", overallScore: "7.5", description: "Mantequilla sin sal asturiana. Elaborada con nata fresca. Sabor suave y cremoso." },
    { name: "Central Lechera Asturiana Salada", slug: "cla-salada", brandId: b("central-lechera-asturiana"), categoryId: c("salada"), denominationId: denominationRows[0]?.id, fatPercentage: "80", saltPercentage: "1.2", waterPercentage: "16", milkType: "vaca", isOrganic: false, isClarified: false, isSpreadable: false, color: "amarillo pálido", ingredients: ["nata de vaca pasteurizada", "sal"], additives: [], allergens: ["leche"], caloriesKcal: "730", totalFatG: "80", saturatedFatG: "52", transFatG: "2.5", cholesterolMg: "215", sodiumMg: "800", proteinG: "0.5", carbsG: "0.5", weightG: 250, format: "barra", packagingType: "papel", qualityScore: "8.3", valueScore: "7.0", nutritionScore: "6.2", overallScore: "7.1", description: "Mantequilla salada clásica asturiana. Ideal para cocinar y tostadas." },

    // === LURPAK ===
    { name: "Lurpak Mantequilla Sin Sal", slug: "lurpak-sin-sal", brandId: b("lurpak"), categoryId: c("sin-sal"), fatPercentage: "82", saltPercentage: "0", waterPercentage: "16", milkType: "vaca", isOrganic: false, isClarified: false, isSpreadable: false, color: "amarillo intenso", ingredients: ["nata de vaca pasteurizada"], additives: [], allergens: ["leche"], caloriesKcal: "742", totalFatG: "82", saturatedFatG: "55", transFatG: "2.0", cholesterolMg: "225", sodiumMg: "8", proteinG: "0.5", carbsG: "0.5", weightG: 250, format: "barra", packagingType: "papel", qualityScore: "8.8", valueScore: "6.5", nutritionScore: "6.5", overallScore: "7.2", description: "Mantequilla danesa premium. Sabor intenso y cremoso, excelente para repostería." },
    { name: "Lurpak Untable Suave", slug: "lurpak-untable", brandId: b("lurpak"), categoryId: c("untable"), fatPercentage: "72", saltPercentage: "0.8", waterPercentage: "24", milkType: "vaca", isOrganic: false, isClarified: false, isSpreadable: true, color: "amarillo pálido", ingredients: ["nata de vaca pasteurizada", "aceite de colza", "sal", "emulsionante (lecitina de girasol)"], additives: ["lecitina de girasol"], allergens: ["leche"], caloriesKcal: "650", totalFatG: "72", saturatedFatG: "38", transFatG: "1.0", cholesterolMg: "150", sodiumMg: "600", proteinG: "0.4", carbsG: "0.8", weightG: 300, format: "tarrina", packagingType: "tapa_plastico", qualityScore: "7.0", valueScore: "5.5", nutritionScore: "5.8", overallScore: "6.1", description: "Mantequilla untable mezclada con aceite vegetal. Se unta directamente del frigorífico." },

    // === KERRYGOLD ===
    { name: "Kerrygold Mantequilla Sin Sal", slug: "kerrygold-sin-sal", brandId: b("kerrygold"), categoryId: c("sin-sal"), fatPercentage: "82", saltPercentage: "0", waterPercentage: "16", milkType: "vaca", isOrganic: false, isClarified: false, isSpreadable: false, color: "amarillo intenso", ingredients: ["nata de vaca pasteurizada de leche de hierba"], additives: [], allergens: ["leche"], caloriesKcal: "742", totalFatG: "82", saturatedFatG: "56", transFatG: "2.0", cholesterolMg: "230", sodiumMg: "8", proteinG: "0.5", carbsG: "0.5", weightG: 250, format: "barra", packagingType: "papel", qualityScore: "9.0", valueScore: "5.8", nutritionScore: "6.5", overallScore: "7.0", description: "Mantequilla irlandesa de vacas alimentadas con hierba. Color amarillo intenso natural, sabor profundo." },

    // === PRÉSIDENT ===
    { name: "Président Mantequilla Sin Sal", slug: "president-sin-sal", brandId: b("president"), categoryId: c("sin-sal"), fatPercentage: "82", saltPercentage: "0", waterPercentage: "16", milkType: "vaca", isOrganic: false, isClarified: false, isSpreadable: false, color: "amarillo", ingredients: ["nata de vaca pasteurizada"], additives: [], allergens: ["leche"], caloriesKcal: "742", totalFatG: "82", saturatedFatG: "54", transFatG: "2.2", cholesterolMg: "220", sodiumMg: "10", proteinG: "0.5", carbsG: "0.5", weightG: 250, format: "barra", packagingType: "papel", qualityScore: "8.0", valueScore: "6.5", nutritionScore: "6.5", overallScore: "7.0", description: "Mantequilla francesa clásica. Buena relación calidad-precio para uso diario." },

    // === ARIAS ===
    { name: "Mantequerías Arias Salada", slug: "arias-salada", brandId: b("mantequerias-arias"), categoryId: c("salada"), fatPercentage: "80", saltPercentage: "1.5", waterPercentage: "16", milkType: "vaca", isOrganic: false, isClarified: false, isSpreadable: false, color: "amarillo pálido", ingredients: ["nata de vaca pasteurizada", "sal"], additives: [], allergens: ["leche"], caloriesKcal: "730", totalFatG: "80", saturatedFatG: "52", transFatG: "2.5", cholesterolMg: "215", sodiumMg: "900", proteinG: "0.5", carbsG: "0.5", weightG: 250, format: "barra", packagingType: "papel", qualityScore: "7.5", valueScore: "8.0", nutritionScore: "5.8", overallScore: "7.1", description: "Mantequilla tradicional madrileña. Clásica en las cocinas españolas." },

    // === TULIPÁN ===
    { name: "Tulipán Untable Sin Sal", slug: "tulipan-untable-sin-sal", brandId: b("tulipan"), categoryId: c("untable"), fatPercentage: "60", saltPercentage: "0.5", waterPercentage: "34", milkType: "vaca", isOrganic: false, isClarified: false, isSpreadable: true, color: "amarillo claro", ingredients: ["nata de vaca pasteurizada", "aceite de girasol", "aceite de colza", "emulsionante (lecitina de girasol)", "sal", "vitamina A", "vitamina D"], additives: ["lecitina de girasol", "vitamina A", "vitamina D"], allergens: ["leche"], caloriesKcal: "540", totalFatG: "60", saturatedFatG: "22", transFatG: "0.8", cholesterolMg: "100", sodiumMg: "450", proteinG: "0.4", carbsG: "0.8", weightG: 400, format: "tarrina", packagingType: "tapa_plastico", qualityScore: "5.5", valueScore: "7.0", nutritionScore: "6.5", overallScore: "6.3", description: "Untable clásico español. Bajo en grasa saturada por la mezcla con aceite vegetal." },
    { name: "Tulipán Untable Salada", slug: "tulipan-untable-salada", brandId: b("tulipan"), categoryId: c("untable"), fatPercentage: "60", saltPercentage: "1.0", waterPercentage: "34", milkType: "vaca", isOrganic: false, isClarified: false, isSpreadable: true, color: "amarillo claro", ingredients: ["nata de vaca pasteurizada", "aceite de girasol", "aceite de colza", "emulsionante (lecitina de girasol)", "sal", "vitamina A", "vitamina D"], additives: ["lecitina de girasol", "vitamina A", "vitamina D"], allergens: ["leche"], caloriesKcal: "540", totalFatG: "60", saturatedFatG: "22", transFatG: "0.8", cholesterolMg: "100", sodiumMg: "650", proteinG: "0.4", carbsG: "0.8", weightG: 400, format: "tarrina", packagingType: "tapa_plastico", qualityScore: "5.5", valueScore: "7.2", nutritionScore: "5.8", overallScore: "6.2", description: "Versión salada del untable Tulipán. Sabor más intenso para tostadas." },

    // === FLORA ===
    { name: "Flora Untable Sin Sal", slug: "flora-untable-sin-sal", brandId: b("flora"), categoryId: c("untable"), fatPercentage: "65", saltPercentage: "0.3", waterPercentage: "30", milkType: "vaca", isOrganic: false, isClarified: false, isSpreadable: true, color: "amarillo claro", ingredients: ["aceite de girasol", "nata de vaca pasteurizada", "aceite de colza", "emulsionante (lecitina de girasol)", "sal", "vitamina A", "vitamina D", "vitamina E"], additives: ["lecitina de girasol", "vitamina A", "vitamina D", "vitamina E"], allergens: ["leche"], caloriesKcal: "585", totalFatG: "65", saturatedFatG: "20", transFatG: "0.5", cholesterolMg: "80", sodiumMg: "350", proteinG: "0.3", carbsG: "0.8", weightG: 400, format: "tarrina", packagingType: "tapa_plastico", qualityScore: "5.2", valueScore: "6.8", nutritionScore: "7.0", overallScore: "6.3", description: "Untable con alto contenido en aceite vegetal. Rico en vitaminas A, D y E." },

    // === BECEL ===
    { name: "Becel Untable ProActiv", slug: "becel-proactiv", brandId: b("becel"), categoryId: c("untable"), fatPercentage: "55", saltPercentage: "0.5", waterPercentage: "40", milkType: "vaca", isOrganic: false, isClarified: false, isSpreadable: true, color: "amarillo claro", ingredients: ["aceite de girasol", "aceite de colza", "aceite de linaza", "nata de vaca pasteurizada", "emulsionante (lecitina de girasol)", "sal", "vitamina A", "vitamina D", "vitamina E", "ésteres de estanol vegetal"], additives: ["lecitina de girasol", "vitamina A", "vitamina D", "vitamina E", "ésteres de estanol vegetal"], allergens: ["leche"], caloriesKcal: "495", totalFatG: "55", saturatedFatG: "12", transFatG: "0.3", cholesterolMg: "5", sodiumMg: "400", proteinG: "0.3", carbsG: "0.8", weightG: 375, format: "tarrina", packagingType: "tapa_plastico", qualityScore: "4.5", valueScore: "5.5", nutritionScore: "8.5", overallScore: "6.2", description: "Untable funcional con fitoesteroles. Ayuda a reducir el colesterol." },

    // === CARREFOUR ===
    { name: "Carrefour Mantequilla Sin Sal", slug: "carrefour-sin-sal", brandId: b("carrefour-brand"), categoryId: c("sin-sal"), fatPercentage: "82", saltPercentage: "0", waterPercentage: "16", milkType: "vaca", isOrganic: false, isClarified: false, isSpreadable: false, color: "amarillo pálido", ingredients: ["nata de vaca pasteurizada"], additives: [], allergens: ["leche"], caloriesKcal: "742", totalFatG: "82", saturatedFatG: "54", transFatG: "2.5", cholesterolMg: "220", sodiumMg: "10", proteinG: "0.5", carbsG: "0.5", weightG: 250, format: "barra", packagingType: "papel", qualityScore: "7.5", valueScore: "8.0", nutritionScore: "6.5", overallScore: "7.3", description: "Mantequilla sin sal de marca Carrefour. Buena relación calidad-precio." },
    { name: "Carrefour Mantequilla Ecológica Sin Sal", slug: "carrefour-eco-sin-sal", brandId: b("carrefour-brand"), categoryId: c("ecologica"), fatPercentage: "82", saltPercentage: "0", waterPercentage: "16", milkType: "vaca", isOrganic: true, isClarified: false, isSpreadable: false, color: "amarillo", ingredients: ["nata de vaca ecológica pasteurizada"], additives: [], allergens: ["leche"], caloriesKcal: "742", totalFatG: "82", saturatedFatG: "54", transFatG: "1.8", cholesterolMg: "205", sodiumMg: "10", proteinG: "0.5", carbsG: "0.5", weightG: 250, format: "barra", packagingType: "papel", qualityScore: "8.5", valueScore: "7.0", nutritionScore: "7.0", overallScore: "7.5", description: "Mantequilla ecológica sin sal de Carrefour. Leche de vacas ecológicas." },

    // === DIA ===
    { name: "Dia Mantequilla Sin Sal", slug: "dia-sin-sal", brandId: b("dia-brand"), categoryId: c("sin-sal"), fatPercentage: "82", saltPercentage: "0", waterPercentage: "16", milkType: "vaca", isOrganic: false, isClarified: false, isSpreadable: false, color: "amarillo pálido", ingredients: ["nata de vaca pasteurizada"], additives: [], allergens: ["leche"], caloriesKcal: "742", totalFatG: "82", saturatedFatG: "54", transFatG: "2.5", cholesterolMg: "220", sodiumMg: "10", proteinG: "0.5", carbsG: "0.5", weightG: 250, format: "barra", packagingType: "papel", qualityScore: "7.0", valueScore: "8.5", nutritionScore: "6.5", overallScore: "7.3", description: "Mantequilla sin sal de marca Dia. Económica y funcional." },

    // === EROSKI ===
    { name: "Eroski Mantequilla Sin Sal", slug: "eroski-sin-sal", brandId: b("eroski-brand"), categoryId: c("sin-sal"), fatPercentage: "82", saltPercentage: "0", waterPercentage: "16", milkType: "vaca", isOrganic: false, isClarified: false, isSpreadable: false, color: "amarillo pálido", ingredients: ["nata de vaca pasteurizada"], additives: [], allergens: ["leche"], caloriesKcal: "742", totalFatG: "82", saturatedFatG: "54", transFatG: "2.5", cholesterolMg: "220", sodiumMg: "10", proteinG: "0.5", carbsG: "0.5", weightG: 250, format: "barra", packagingType: "papel", qualityScore: "7.2", valueScore: "8.0", nutritionScore: "6.5", overallScore: "7.2", description: "Mantequilla sin sal de marca Eroski." },

    // === MILBONA (LIDL) ===
    { name: "Milbona Mantequilla Sin Sal", slug: "milbona-sin-sal", brandId: b("milbona-lidl"), categoryId: c("sin-sal"), fatPercentage: "82", saltPercentage: "0", waterPercentage: "16", milkType: "vaca", isOrganic: false, isClarified: false, isSpreadable: false, color: "amarillo pálido", ingredients: ["nata de vaca pasteurizada"], additives: [], allergens: ["leche"], caloriesKcal: "742", totalFatG: "82", saturatedFatG: "54", transFatG: "2.5", cholesterolMg: "220", sodiumMg: "10", proteinG: "0.5", carbsG: "0.5", weightG: 250, format: "barra", packagingType: "papel", qualityScore: "7.3", valueScore: "9.0", nutritionScore: "6.5", overallScore: "7.6", description: "Mantequilla sin sal de Lidl (Milbona). Mejor precio del mercado." },

    // === CORALE (ALDI) ===
    { name: "Corale Mantequilla Sin Sal", slug: "corale-sin-sal", brandId: b("corale-aldi"), categoryId: c("sin-sal"), fatPercentage: "82", saltPercentage: "0", waterPercentage: "16", milkType: "vaca", isOrganic: false, isClarified: false, isSpreadable: false, color: "amarillo pálido", ingredients: ["nata de vaca pasteurizada"], additives: [], allergens: ["leche"], caloriesKcal: "742", totalFatG: "82", saturatedFatG: "54", transFatG: "2.5", cholesterolMg: "220", sodiumMg: "10", proteinG: "0.5", carbsG: "0.5", weightG: 250, format: "barra", packagingType: "papel", qualityScore: "7.2", valueScore: "9.0", nutritionScore: "6.5", overallScore: "7.6", description: "Mantequilla sin sal de Aldi (Corale). Mejor precio del mercado." },

    // === AUCHAN (ALCAMPO) ===
    { name: "Auchan Mantequilla Sin Sal", slug: "auchan-sin-sal", brandId: b("auchan-brand"), categoryId: c("sin-sal"), fatPercentage: "82", saltPercentage: "0", waterPercentage: "16", milkType: "vaca", isOrganic: false, isClarified: false, isSpreadable: false, color: "amarillo pálido", ingredients: ["nata de vaca pasteurizada"], additives: [], allergens: ["leche"], caloriesKcal: "742", totalFatG: "82", saturatedFatG: "54", transFatG: "2.5", cholesterolMg: "220", sodiumMg: "10", proteinG: "0.5", carbsG: "0.5", weightG: 250, format: "barra", packagingType: "papel", qualityScore: "7.2", valueScore: "8.2", nutritionScore: "6.5", overallScore: "7.3", description: "Mantequilla sin sal de marca Auchan (Alcampo)." },

    // === ECI ===
    { name: "El Corte Inglés Mantequilla Ecológica Sin Sal", slug: "eci-eco-sin-sal", brandId: b("el-corte-ingles-brand"), categoryId: c("ecologica"), fatPercentage: "82", saltPercentage: "0", waterPercentage: "16", milkType: "vaca", isOrganic: true, isClarified: false, isSpreadable: false, color: "amarillo intenso", ingredients: ["nata de vaca ecológica pasteurizada"], additives: [], allergens: ["leche"], caloriesKcal: "742", totalFatG: "82", saturatedFatG: "54", transFatG: "1.8", cholesterolMg: "205", sodiumMg: "10", proteinG: "0.5", carbsG: "0.5", weightG: 250, format: "barra", packagingType: "papel", qualityScore: "9.0", valueScore: "5.5", nutritionScore: "7.2", overallScore: "7.2", description: "Mantequilla ecológica premium de El Corte Inglés." },

    // === GHEE LURPAK ===
    { name: "Lurpak Ghee Clarificado", slug: "lurpak-ghee", brandId: b("lurpak"), categoryId: c("ghee"), fatPercentage: "99.9", saltPercentage: "0", waterPercentage: "0", milkType: "vaca", isOrganic: false, isClarified: true, isSpreadable: false, color: "dorado", ingredients: ["mantequilla clarificada de vaca"], additives: [], allergens: ["leche"], caloriesKcal: "900", totalFatG: "99.9", saturatedFatG: "66", transFatG: "3.0", cholesterolMg: "250", sodiumMg: "0", proteinG: "0", carbsG: "0", weightG: 500, format: "tarro", packagingType: "vidrio", qualityScore: "9.0", valueScore: "5.0", nutritionScore: "4.0", overallScore: "6.0", description: "Ghee clarificado de Lurpak. Punto de humo alto, ideal para cocinar." },

    // === CLA SEMISALADA ===
    { name: "Central Lechera Asturiana Semisalada", slug: "cla-semisalada", brandId: b("central-lechera-asturiana"), categoryId: c("semisalada"), denominationId: denominationRows[0]?.id, fatPercentage: "81", saltPercentage: "0.6", waterPercentage: "16", milkType: "vaca", isOrganic: false, isClarified: false, isSpreadable: false, color: "amarillo pálido", ingredients: ["nata de vaca pasteurizada", "sal"], additives: [], allergens: ["leche"], caloriesKcal: "735", totalFatG: "81", saturatedFatG: "53", transFatG: "2.5", cholesterolMg: "218", sodiumMg: "450", proteinG: "0.5", carbsG: "0.5", weightG: 250, format: "barra", packagingType: "papel", qualityScore: "8.4", valueScore: "7.2", nutritionScore: "6.4", overallScore: "7.3", description: "Mantequilla semisalada asturiana. Punto intermedio perfecto." },

    // === BERTOLLI ===
    { name: "Bertolli Untable con Aceite de Oliva", slug: "bertolli-oliva", brandId: b("bertolli"), categoryId: c("untable"), fatPercentage: "65", saltPercentage: "0.6", waterPercentage: "30", milkType: "vaca", isOrganic: false, isClarified: false, isSpreadable: true, color: "amarillo verdoso", ingredients: ["aceite de oliva", "nata de vaca pasteurizada", "aceite de girasol", "emulsionante (lecitina de girasol)", "sal", "vitamina A", "vitamina D"], additives: ["lecitina de girasol", "vitamina A", "vitamina D"], allergens: ["leche"], caloriesKcal: "585", totalFatG: "65", saturatedFatG: "24", transFatG: "0.5", cholesterolMg: "85", sodiumMg: "500", proteinG: "0.3", carbsG: "0.8", weightG: 400, format: "tarrina", packagingType: "tapa_plastico", qualityScore: "5.8", valueScore: "6.5", nutritionScore: "7.2", overallScore: "6.5", description: "Untable con aceite de oliva. Perfil graso más saludable." },
  ]).returning();

  // --- Butter-Supermarket relationships (more realistic) ---
  const bs = (butterSlug: string, supermarketSlug: string, price: string, per100g: string, avail: string) => ({
    butterId: butterRows.find(x => x.slug === butterSlug)!.id,
    supermarketId: supermarketRows.find(x => x.slug === supermarketSlug)!.id,
    priceEur: price,
    pricePer100g: per100g,
    availability: avail,
  });

  await db.insert(butterSupermarkets).values([
    // MERCADONA: Hacendado + CLA + Tulipán + Flora + Arias (no Kerrygold, no Président, no Lurpak untable)
    bs("hacendado-sin-sal", "mercadona", "1.70", "0.68", "disponible"),
    bs("hacendado-salada", "mercadona", "1.65", "0.66", "disponible"),
    bs("hacendado-untable", "mercadona", "1.85", "0.46", "disponible"),
    bs("cla-sin-sal", "mercadona", "2.40", "0.96", "disponible"),
    bs("cla-salada", "mercadona", "2.35", "0.94", "disponible"),
    bs("cla-semisalada", "mercadona", "2.40", "0.96", "disponible"),
    bs("arias-salada", "mercadona", "1.80", "0.72", "disponible"),
    bs("tulipan-untable-sin-sal", "mercadona", "2.30", "0.58", "disponible"),
    bs("tulipan-untable-salada", "mercadona", "2.30", "0.58", "disponible"),
    bs("flora-untable-sin-sal", "mercadona", "2.50", "0.63", "disponible"),
    bs("becel-proactiv", "mercadona", "3.90", "1.04", "disponible"),

    // CARREFOUR: marca propia + CLA + Lurpak + Kerrygold + Président + Tulipán + Arias + untables + eco
    bs("carrefour-sin-sal", "carrefour", "1.75", "0.70", "disponible"),
    bs("carrefour-eco-sin-sal", "carrefour", "3.20", "1.28", "disponible"),
    bs("cla-sin-sal", "carrefour", "2.55", "1.02", "disponible"),
    bs("cla-salada", "carrefour", "2.50", "1.00", "disponible"),
    bs("lurpak-sin-sal", "carrefour", "3.45", "1.38", "disponible"),
    bs("lurpak-untable", "carrefour", "3.90", "1.30", "disponible"),
    bs("kerrygold-sin-sal", "carrefour", "3.65", "1.46", "disponible"),
    bs("president-sin-sal", "carrefour", "2.95", "1.18", "disponible"),
    bs("arias-salada", "carrefour", "1.85", "0.74", "disponible"),
    bs("tulipan-untable-sin-sal", "carrefour", "2.40", "0.60", "disponible"),
    bs("tulipan-untable-salada", "carrefour", "2.40", "0.60", "disponible"),
    bs("flora-untable-sin-sal", "carrefour", "2.60", "0.65", "disponible"),
    bs("becel-proactiv", "carrefour", "4.00", "1.07", "disponible"),
    bs("bertolli-oliva", "carrefour", "2.95", "0.74", "disponible"),
    bs("lurpak-ghee", "carrefour", "6.50", "1.30", "disponible"),
    bs("cla-semisalada", "carrefour", "2.55", "1.02", "disponible"),

    // DIA: marca propia + Arias + Tulipán + Flora
    bs("dia-sin-sal", "dia", "1.60", "0.64", "disponible"),
    bs("arias-salada", "dia", "1.80", "0.72", "disponible"),
    bs("tulipan-untable-sin-sal", "dia", "2.35", "0.59", "disponible"),
    bs("tulipan-untable-salada", "dia", "2.35", "0.59", "disponible"),
    bs("flora-untable-sin-sal", "dia", "2.55", "0.64", "disponible"),
    bs("president-sin-sal", "dia", "3.00", "1.20", "ocasional"),

    // LIDL: Milbona + Kerrygold
    bs("milbona-sin-sal", "lidl", "1.55", "0.62", "disponible"),
    bs("kerrygold-sin-sal", "lidl", "3.30", "1.32", "disponible"),

    // ALDI: Corale
    bs("corale-sin-sal", "aldi", "1.50", "0.60", "disponible"),

    // EROSKI: marca propia + CLA + Arias + Tulipán
    bs("eroski-sin-sal", "eroski", "1.70", "0.68", "disponible"),
    bs("cla-sin-sal", "eroski", "2.50", "1.00", "disponible"),
    bs("cla-salada", "eroski", "2.45", "0.98", "disponible"),
    bs("arias-salada", "eroski", "1.80", "0.72", "disponible"),
    bs("tulipan-untable-sin-sal", "eroski", "2.35", "0.59", "disponible"),

    // CONSUM: Eroski brand + CLA
    bs("eroski-sin-sal", "consum", "1.70", "0.68", "disponible"),
    bs("cla-sin-sal", "consum", "2.50", "1.00", "disponible"),
    bs("cla-semisalada", "consum", "2.50", "1.00", "disponible"),

    // ALCAMPO: Auchan + Lurpak + Président + CLA + Becel + Bertolli + Ghee
    bs("auchan-sin-sal", "alcampo", "1.70", "0.68", "disponible"),
    bs("lurpak-sin-sal", "alcampo", "3.30", "1.32", "disponible"),
    bs("lurpak-untable", "alcampo", "3.80", "1.27", "disponible"),
    bs("president-sin-sal", "alcampo", "2.90", "1.16", "disponible"),
    bs("cla-sin-sal", "alcampo", "2.45", "0.98", "disponible"),
    bs("becel-proactiv", "alcampo", "3.90", "1.04", "disponible"),
    bs("bertolli-oliva", "alcampo", "2.90", "0.73", "disponible"),
    bs("lurpak-ghee", "alcampo", "6.30", "1.26", "disponible"),

    // EL CORTE INGLÉS: premium brands + eco
    bs("kerrygold-sin-sal", "el-corte-ingles", "3.80", "1.52", "disponible"),
    bs("lurpak-sin-sal", "el-corte-ingles", "3.60", "1.44", "disponible"),
    bs("eci-eco-sin-sal", "el-corte-ingles", "3.80", "1.52", "disponible"),
    bs("cla-sin-sal", "el-corte-ingles", "2.65", "1.06", "disponible"),

    // HIPERCOR: premium
    bs("lurpak-sin-sal", "hipercor", "3.55", "1.42", "disponible"),
    bs("eci-eco-sin-sal", "hipercor", "3.75", "1.50", "disponible"),
  ]);

  console.log("Seed complete!");
}

seed().catch(console.error);