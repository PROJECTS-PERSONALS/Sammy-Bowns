/* CONFIGURACIÓN GENERAL */
const DEFAULT_CONFIG = {
	nombreEmpresa: "Sammy Bowns",
	whatsappNumero: "573217269632", // REEMPLAZAR si el número cambia
	moneda: "$",
	tagline: "Todo lo que necesitas para peinar con amor y elevar tus outfits 🎀",
	email: "ventasammybowns@gmail.com",
	// REEMPLAZAR: coloca aquí los enlaces reales de TikTok e Instagram de la tienda
	tiktok: "https://www.tiktok.com/@sammybowns",
	instagram: "https://www.instagram.com/sammybowns",
	whatsappMensaje: "Hola, estoy interesado en los productos de Sammy Bowns.",
};

/* DATOS DE CATEGORÍAS
   Generadas a partir de las carpetas reales dentro de "img/" (una carpeta
   por categoría). El "name" de cada categoría debe coincidir EXACTAMENTE
   con el campo "category" de los productos. La imagen usa la primera foto
   real disponible de esa carpeta; si la carpeta aún no tiene fotos, se
   muestra el emoji como marcador temporal. */
const DEFAULT_CATEGORIES = [
	{ id: "cat1", name: "Colección Escolar", emoji: "🎒", image: "img/coleccion_escolar/CEBOLLERO REF 001_23000.jpeg" },
	{ id: "cat2", name: "Colección Princesas", emoji: "👑", image: "img/coleccion_princesas/MAXI ARIEL REF 005- 26000.jpeg" },
	{ id: "cat3", name: "Colección Bebés", emoji: "🍼", image: "" },
	{ id: "cat4", name: "Fiestas", emoji: "🎉", image: "" },
	{ id: "cat5", name: "Navidad", emoji: "🎄", image: "img/navidad/MAXI NAVIDAD_26000.jpeg" },
	{ id: "cat6", name: "Diademas", emoji: "💎", image: "img/diademas/DIADEMA FLORAL_25000.jpeg" },
	{ id: "cat7", name: "Clips Variados", emoji: "📎", image: "img/clips_variados/COLERO ANA Y ELSA REF 019_15000.jpeg" },
	{ id: "cat8", name: "Kanekalon", emoji: "💇", image: "" },
	{ id: "cat9", name: "Kit Para Peinados", emoji: "🎀", image: "img/kit_para_peinados/CORTA LIGAS - 2000 UNIDAD.jpeg" },
	{ id: "cat10", name: "Colombia", emoji: "🇨🇴", image: "img/colombia/MAXI CORAZÓN REF002 - 15000.jpeg" },
	{ id: "cat11", name: "Combos Promo", emoji: "🎁", image: "img/combos_promo/COMBO CHILINDRINA + MUERCILEAGOS_REF 012_51000.jpeg" },
];

/* DATOS DE PRODUCTOS
   Generados automáticamente a partir de los archivos reales dentro de
   "img/<categoria>/". El nombre y el precio se extrajeron del nombre del
   archivo (ej: "PAR ESCOLAR REF 001_24000.jpeg" -> "Par Escolar REF 001",
   $24.000). Revisa y ajusta nombres/precios/descuentos desde el panel
   administrativo o directamente aquí si algo no coincide exactamente. */
const DEFAULT_PRODUCTS = [
	{ id: "p1", name: "Colero Ana Y Elsa REF 019", category: "Clips Variados", price: 15000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/clips_variados/COLERO ANA Y ELSA REF 019_15000.jpeg" },
	{ id: "p2", name: "Colero Bluey", category: "Clips Variados", price: 15000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/clips_variados/COLERO BLUEY_15000.jpeg" },
	{ id: "p3", name: "Colero Kitty REF 023", category: "Clips Variados", price: 15000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/clips_variados/COLERO KITTY REF 023_15000.jpeg" },
	{ id: "p4", name: "Colero Masha REF 024", category: "Clips Variados", price: 15000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/clips_variados/COLERO MASHA REF 024_15000.jpeg" },
	{ id: "p5", name: "Colero Stich REF 020", category: "Clips Variados", price: 15000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/clips_variados/COLERO STICH REF 020_15000.jpeg" },
	{ id: "p6", name: "Maxi Corazones REF 016", category: "Clips Variados", price: 18000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/clips_variados/MAXI CORAZONES REF 016_18000.jpeg" },
	{ id: "p7", name: "Maxi Corazones REF 017", category: "Clips Variados", price: 18000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/clips_variados/MAXI CORAZONES REF 017_18000.jpeg" },
	{ id: "p8", name: "Maxi Flower Violeta REF 022", category: "Clips Variados", price: 18000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/clips_variados/MAXI FLOWER VIOLETA REF 022_18000.jpeg" },
	{ id: "p9", name: "Maxi Muñeca REF 021", category: "Clips Variados", price: 18000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/clips_variados/MAXI MUÑECA REF 021_18000.jpeg" },
	{ id: "p10", name: "Par Bailarina Ref004", category: "Clips Variados", price: 24000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/clips_variados/PAR BAILARINA REF004_24000.jpeg" },
	{ id: "p11", name: "Par Cerdita Menta Ref005", category: "Clips Variados", price: 24000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/clips_variados/PAR CERDITA MENTA REF005_24000.jpeg" },
	{ id: "p12", name: "Par Cerdita Violeta Ref006", category: "Clips Variados", price: 24000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/clips_variados/PAR CERDITA VIOLETA REF006_24000.jpeg" },
	{ id: "p13", name: "Par Cerezas Ref008", category: "Clips Variados", price: 24000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/clips_variados/PAR CEREZAS REF008_24000.jpeg" },
	{ id: "p14", name: "Par Coquette Corazón Ref0010", category: "Clips Variados", price: 13000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/clips_variados/PAR COQUETTE CORAZÓN REF0010_13000.jpeg" },
	{ id: "p15", name: "Par Coquette Corazón Ref0011", category: "Clips Variados", price: 13000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/clips_variados/PAR COQUETTE CORAZÓN REF0011_13000.jpeg" },
	{ id: "p16", name: "Par Coquette Corazón Ref0012", category: "Clips Variados", price: 13000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/clips_variados/PAR COQUETTE CORAZÓN REF0012_13000.jpeg" },
	{ id: "p17", name: "Par Coquette Corazón Ref0013", category: "Clips Variados", price: 13000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/clips_variados/PAR COQUETTE CORAZÓN REF0013_13000.jpeg" },
	{ id: "p18", name: "Par Encaje REF 0016", category: "Clips Variados", price: 13000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/clips_variados/PAR ENCAJE REF 0016_13000.jpeg" },
	{ id: "p19", name: "Par Encaje REF 025", category: "Clips Variados", price: 22000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/clips_variados/PAR ENCAJE REF 025_22000.jpeg" },
	{ id: "p20", name: "Par Encaje REF 026", category: "Clips Variados", price: 22000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/clips_variados/PAR ENCAJE REF 026_22000.jpeg" },
	{ id: "p21", name: "Par Encaje REF 027", category: "Clips Variados", price: 22000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/clips_variados/PAR ENCAJE REF 027_22000.jpeg" },
	{ id: "p22", name: "Par Flower REF 0014", category: "Clips Variados", price: 13000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/clips_variados/PAR FLOWER REF 0014_13000.jpeg" },
	{ id: "p23", name: "Par Flower REF 0015", category: "Clips Variados", price: 13000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/clips_variados/PAR FLOWER REF 0015_13000.jpeg" },
	{ id: "p24", name: "Par Labubu Ref001", category: "Clips Variados", price: 24000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/clips_variados/PAR LABUBU REF001 - 24000.jpeg" },
	{ id: "p25", name: "Par Niña Amarillo Ref007", category: "Clips Variados", price: 24000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/clips_variados/PAR NIÑA AMARILLO REF007_24000.jpeg" },
	{ id: "p26", name: "Par Orejas Minnie Flores Ref009", category: "Clips Variados", price: 24000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/clips_variados/PAR OREJAS MINNIE FLORES REF009_24000.jpeg" },
	{ id: "p27", name: "Par Osa Menta Ref002", category: "Clips Variados", price: 24000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/clips_variados/PAR OSA MENTA REF002_24000.jpeg" },
	{ id: "p28", name: "Par Osa Rosa Ref003", category: "Clips Variados", price: 24000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/clips_variados/PAR OSA ROSA REF003_24000.jpeg" },
	{ id: "p29", name: "Par Oso Amarillo Ref006", category: "Clips Variados", price: 24000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/clips_variados/PAR OSO AMARILLO REF006_24000.jpeg" },
	{ id: "p30", name: "Cebollero REF 001", category: "Colección Escolar", price: 23000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/coleccion_escolar/CEBOLLERO REF 001_23000.jpeg" },
	{ id: "p31", name: "Cebollero REF 002", category: "Colección Escolar", price: 23000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/coleccion_escolar/CEBOLLERO REF 002_23000.jpeg" },
	{ id: "p32", name: "Maxi Escolar REF 001", category: "Colección Escolar", price: 26000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/coleccion_escolar/MAXI ESCOLAR REF 001_26000.jpeg" },
	{ id: "p33", name: "Maxi Escolar REF 002", category: "Colección Escolar", price: 26000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/coleccion_escolar/MAXI ESCOLAR REF 002_26000.jpeg" },
	{ id: "p34", name: "Maxi Escolar REF 003", category: "Colección Escolar", price: 26000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/coleccion_escolar/MAXI ESCOLAR REF 003_26000.jpeg" },
	{ id: "p35", name: "Maxi Escolar REF 004", category: "Colección Escolar", price: 26000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/coleccion_escolar/MAXI ESCOLAR REF 004_26000.jpeg" },
	{ id: "p36", name: "Maxi Escolar REF 005", category: "Colección Escolar", price: 26000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/coleccion_escolar/MAXI ESCOLAR REF 005_26000.jpeg" },
	{ id: "p37", name: "Maxi Escolar REF 006", category: "Colección Escolar", price: 26000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/coleccion_escolar/MAXI ESCOLAR REF 006_26000.jpeg" },
	{ id: "p38", name: "Maxi Escolar REF 007", category: "Colección Escolar", price: 26000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/coleccion_escolar/MAXI ESCOLAR REF 007_26000.jpeg" },
	{ id: "p39", name: "Maxi Escolar REF 008", category: "Colección Escolar", price: 26000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/coleccion_escolar/MAXI ESCOLAR REF 008_26000.jpeg" },
	{ id: "p40", name: "Maxi Escolar REF 009", category: "Colección Escolar", price: 26000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/coleccion_escolar/MAXI ESCOLAR REF 009_26000.jpeg" },
	{ id: "p41", name: "Maxi Escolar REF 010", category: "Colección Escolar", price: 26000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/coleccion_escolar/MAXI ESCOLAR REF 010_26000.jpeg" },
	{ id: "p42", name: "Maxi Escolar REF 011", category: "Colección Escolar", price: 26000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/coleccion_escolar/MAXI ESCOLAR REF 011_26000.jpeg" },
	{ id: "p43", name: "Maxi Escolar REF 012", category: "Colección Escolar", price: 26000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/coleccion_escolar/MAXI ESCOLAR REF 012_26000.jpeg" },
	{ id: "p44", name: "Maxi Escolar REF 013", category: "Colección Escolar", price: 26000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/coleccion_escolar/MAXI ESCOLAR REF 013_26000.jpeg" },
	{ id: "p45", name: "Maxi Escolar REF 014", category: "Colección Escolar", price: 26000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/coleccion_escolar/MAXI ESCOLAR REF 014_26000.jpeg" },
	{ id: "p46", name: "Maxi Escolar REF 015", category: "Colección Escolar", price: 26000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/coleccion_escolar/MAXI ESCOLAR REF 015_26000.jpeg" },
	{ id: "p47", name: "Par Coquette REF 001", category: "Colección Escolar", price: 13000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/coleccion_escolar/PAR COQUETTE REF 001_13000.jpeg" },
	{ id: "p48", name: "Par Coquette REF 002", category: "Colección Escolar", price: 13000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/coleccion_escolar/PAR COQUETTE REF 002_13000.jpeg" },
	{ id: "p49", name: "Par Coquette REF 003", category: "Colección Escolar", price: 13000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/coleccion_escolar/PAR COQUETTE REF 003_13000.jpeg" },
	{ id: "p50", name: "Par Escolar REF 001", category: "Colección Escolar", price: 24000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/coleccion_escolar/PAR ESCOLAR REF 001_24000.jpeg" },
	{ id: "p51", name: "Par Escolar REF 002", category: "Colección Escolar", price: 24000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/coleccion_escolar/PAR ESCOLAR REF 002_24000.jpeg" },
	{ id: "p52", name: "Par Escolar REF 003", category: "Colección Escolar", price: 24000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/coleccion_escolar/PAR ESCOLAR REF 003_24000.jpeg" },
	{ id: "p53", name: "Par Escolar REF 004", category: "Colección Escolar", price: 24000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/coleccion_escolar/PAR ESCOLAR REF 004_24000.jpeg" },
	{ id: "p54", name: "Par Escolar REF 005", category: "Colección Escolar", price: 24000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/coleccion_escolar/PAR ESCOLAR REF 005_24000.jpeg" },
	{ id: "p55", name: "Par Escolar REF 006", category: "Colección Escolar", price: 24000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/coleccion_escolar/PAR ESCOLAR REF 006_24000.jpeg" },
	{ id: "p56", name: "Par Escolar REF 007", category: "Colección Escolar", price: 24000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/coleccion_escolar/PAR ESCOLAR REF 007_24000.jpeg" },
	{ id: "p57", name: "Par Escolar REF 008", category: "Colección Escolar", price: 24000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/coleccion_escolar/PAR ESCOLAR REF 008_24000.jpeg" },
	{ id: "p58", name: "Par Escolar REF 009", category: "Colección Escolar", price: 24000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/coleccion_escolar/PAR ESCOLAR REF 009_24000.jpeg" },
	{ id: "p59", name: "Par Escolar REF 010", category: "Colección Escolar", price: 24000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/coleccion_escolar/PAR ESCOLAR REF 010_24000.jpeg" },
	{ id: "p60", name: "Par Escolar REF 011", category: "Colección Escolar", price: 24000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/coleccion_escolar/PAR ESCOLAR REF 011_24000.jpeg" },
	{ id: "p61", name: "Par Escolar REF 012", category: "Colección Escolar", price: 24000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/coleccion_escolar/PAR ESCOLAR REF 012_24000.jpeg" },
	{ id: "p62", name: "Par Escolar REF 013", category: "Colección Escolar", price: 24000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/coleccion_escolar/PAR ESCOLAR REF 013_24000.jpeg" },
	{ id: "p63", name: "Par Escolar REF 014", category: "Colección Escolar", price: 24000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/coleccion_escolar/PAR ESCOLAR REF 014_24000.jpeg" },
	{ id: "p64", name: "Par Pompones REF 001", category: "Colección Escolar", price: 15000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/coleccion_escolar/PAR POMPONES REF 001_15000.jpeg" },
	{ id: "p65", name: "Maxi Ariel REF 005", category: "Colección Princesas", price: 26000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/coleccion_princesas/MAXI ARIEL REF 005- 26000.jpeg" },
	{ id: "p66", name: "Maxi Bella REF 001", category: "Colección Princesas", price: 26000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/coleccion_princesas/MAXI BELLA REF 001- 26000.jpeg" },
	{ id: "p67", name: "Maxi Blanca Nieves REF 004", category: "Colección Princesas", price: 26000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/coleccion_princesas/MAXI BLANCA NIEVES REF 004- 26000.jpeg" },
	{ id: "p68", name: "Maxi Bluey REF 002", category: "Colección Princesas", price: 26000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/coleccion_princesas/MAXI BLUEY REF 002- 26000.jpeg" },
	{ id: "p69", name: "Maxi Caperucita REF 003", category: "Colección Princesas", price: 26000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/coleccion_princesas/MAXI CAPERUCITA REF 003- 26000.jpeg" },
	{ id: "p70", name: "Maxi Capibara REF 008", category: "Colección Princesas", price: 26000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/coleccion_princesas/MAXI CAPIBARA REF 008- 26000.jpeg" },
	{ id: "p71", name: "Maxi Celeste REF 009", category: "Colección Princesas", price: 26000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/coleccion_princesas/MAXI CELESTE REF 009- 26000.jpeg" },
	{ id: "p72", name: "Maxi Corazones REF 012", category: "Colección Princesas", price: 26000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/coleccion_princesas/MAXI CORAZONES REF 012- 26000.jpeg" },
	{ id: "p73", name: "Maxi Jazmin REF 010", category: "Colección Princesas", price: 28000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/coleccion_princesas/MAXI JAZMIN REF 010- 28000.jpeg" },
	{ id: "p74", name: "Maxi Jessie REF 007", category: "Colección Princesas", price: 26000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/coleccion_princesas/MAXI JESSIE REF 007- 26000.jpeg" },
	{ id: "p75", name: "Maxi Rapunzel REF 006", category: "Colección Princesas", price: 26000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/coleccion_princesas/MAXI RAPUNZEL REF 006- 26000.jpeg" },
	{ id: "p76", name: "Maxi Sirenita REF 011", category: "Colección Princesas", price: 26000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/coleccion_princesas/MAXI SIRENITA REF 011- 26000.jpeg" },
	{ id: "p77", name: "Maxi Corazón Ref002", category: "Colombia", price: 15000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/colombia/MAXI CORAZÓN REF002 - 15000.jpeg" },
	{ id: "p78", name: "Maxi Corazón Ref003", category: "Colombia", price: 15000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/colombia/MAXI CORAZÓN REF003 - 15000.jpeg" },
	{ id: "p79", name: "Maxi Corazón Ref004", category: "Colombia", price: 15000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/colombia/MAXI CORAZÓN REF004 - 15000.jpeg" },
	{ id: "p80", name: "Maxi Flower Ref001", category: "Colombia", price: 18000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/colombia/MAXI FLOWER REF001 - 18000.jpeg" },
	{ id: "p81", name: "Maxi Tricolor Ref005", category: "Colombia", price: 18000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/colombia/MAXI TRICOLOR REF005- 18000.jpeg" },
	{ id: "p82", name: "Par Colombia Ref001", category: "Colombia", price: 24000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/colombia/PAR COLOMBIA REF001 - 24000.jpeg" },
	{ id: "p83", name: "Par Colombia Ref002", category: "Colombia", price: 24000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/colombia/PAR COLOMBIA REF002 - 24000.jpeg" },
	{ id: "p84", name: "Par Corazón Ref003", category: "Colombia", price: 14000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/colombia/PAR CORAZÓN REF003- 14000.jpeg" },
	{ id: "p85", name: "Super Maxi Corazon Ref004", category: "Colombia", price: 18000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/colombia/SUPER MAXI CORAZON REF004- 18000.jpeg" },
	{ id: "p86", name: "Combo Chilindrina + Muercileagos REF 012", category: "Combos Promo", price: 51000, oldPrice: null, promo: true, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/combos_promo/COMBO CHILINDRINA + MUERCILEAGOS_REF 012_51000.jpeg" },
	{ id: "p87", name: "Combo Corazones + Muercileagos REF 013", category: "Combos Promo", price: 51000, oldPrice: null, promo: true, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/combos_promo/COMBO CORAZONES + MUERCILEAGOS_REF 013_51000.jpeg" },
	{ id: "p88", name: "Combo Fantasmas REF 014", category: "Combos Promo", price: 58000, oldPrice: null, promo: true, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/combos_promo/COMBO FANTASMAS_REF 014_58000.jpeg" },
	{ id: "p89", name: "Combo Maxi + Cebollero Ref003", category: "Combos Promo", price: 47000, oldPrice: null, promo: true, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/combos_promo/COMBO MAXI + CEBOLLERO REF003_47000.jpeg" },
	{ id: "p90", name: "Combo Maxi + Coquette Ref002", category: "Combos Promo", price: 37000, oldPrice: null, promo: true, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/combos_promo/COMBO MAXI + COQUETTE REF002_37000.jpeg" },
	{ id: "p91", name: "Combo Maxi + Par Ref001", category: "Combos Promo", price: 48000, oldPrice: null, promo: true, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/combos_promo/COMBO MAXI + PAR REF001_48000.jpeg" },
	{ id: "p92", name: "Combo Maxi + Par Ref006", category: "Combos Promo", price: 48000, oldPrice: null, promo: true, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/combos_promo/COMBO MAXI + PAR REF006_48000.jpeg" },
	{ id: "p93", name: "Combo Maxi + Par Ref007", category: "Combos Promo", price: 48000, oldPrice: null, promo: true, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/combos_promo/COMBO MAXI + PAR REF007_48000.jpeg" },
	{ id: "p94", name: "Combo Maxi + Pompones Ref004", category: "Combos Promo", price: 39000, oldPrice: null, promo: true, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/combos_promo/COMBO MAXI + POMPONES REF004_39000.jpeg" },
	{ id: "p95", name: "Combo Maxi Navidad + Coquette Ref008", category: "Combos Promo", price: 37000, oldPrice: null, promo: true, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/combos_promo/COMBO MAXI NAVIDAD + COQUETTE REF008_37000.jpeg" },
	{ id: "p96", name: "Combo Maxi Navidad + Par Ref009", category: "Combos Promo", price: 48000, oldPrice: null, promo: true, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/combos_promo/COMBO MAXI NAVIDAD + PAR REF009_48000.jpeg" },
	{ id: "p97", name: "Combo Merlina + Muercileagos REF 011", category: "Combos Promo", price: 51000, oldPrice: null, promo: true, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/combos_promo/COMBO MERLINA + MUERCILEAGOS_REF 011_51000.jpeg" },
	{ id: "p98", name: "Combo Mujer Maravilla + Muercileagos REF 013", category: "Combos Promo", price: 54000, oldPrice: null, promo: true, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/combos_promo/COMBO MUJER MARAVILLA + MUERCILEAGOS_REF 013_54000.jpeg" },
	{ id: "p99", name: "Super Combo Navideño REF 010", category: "Combos Promo", price: 60000, oldPrice: null, promo: true, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/combos_promo/SUPER COMBO NAVIDEÑO_REF 010_60000.jpeg" },
	{ id: "p100", name: "Super Combo Premium REF 005", category: "Combos Promo", price: 96000, oldPrice: null, promo: true, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/combos_promo/SUPER COMBO PREMIUM REF 005_96000.jpeg" },
	{ id: "p101", name: "Diadema Floral", category: "Diademas", price: 25000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/diademas/DIADEMA FLORAL_25000.jpeg" },
	{ id: "p102", name: "Corta Ligas - Unidad", category: "Kit Para Peinados", price: 2000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/kit_para_peinados/CORTA LIGAS - 2000 UNIDAD.jpeg" },
	{ id: "p103", name: "Portamoños", category: "Kit Para Peinados", price: 35000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/kit_para_peinados/PORTAMOÑOS_35000.jpeg" },
	{ id: "p104", name: "Maxi Navidad", category: "Navidad", price: 26000, oldPrice: null, promo: false, featured: false, active: true, sales: 0, dateAdded: "2026-08-01", image: "img/navidad/MAXI NAVIDAD_26000.jpeg" },
];

/* CARGA DE DATOS */
function loadJSON(key, fallback) {
	try {
		const raw = localStorage.getItem(key);
		return raw ? JSON.parse(raw) : fallback;
	} catch {
		return fallback;
	}
}

let CONFIG = { ...DEFAULT_CONFIG, ...loadJSON("store_config", {}) };
let CATEGORIES = loadJSON("store_categories", DEFAULT_CATEGORIES);
let PRODUCTS = loadJSON("store_products", DEFAULT_PRODUCTS);

/* ESTADO DE LA TIENDA (cliente) — el carrito y favoritos NO requieren login */
const state = {
	cart: loadJSON("store_cart", []),
	favorites: loadJSON("store_favorites", []),
	activeCategory: "todos",
	sort: "relevancia",
	search: "",
};

function persistCart() {
	localStorage.setItem("store_cart", JSON.stringify(state.cart));
	localStorage.setItem("store_favorites", JSON.stringify(state.favorites));
}

/* ELEMENTOS DEL DOM */
const grid = document.getElementById("products-grid");
const emptyState = document.getElementById("empty-state");
const cartCountEl = document.getElementById("cart-count");
const categoriesList = document.getElementById("categories-list");
const drawerCategories = document.getElementById("nav-drawer-categories");
const sortSelect = document.getElementById("sort-select");
const categoryTitle = document.getElementById("category-title");
const resultsCount = document.getElementById("results-count");
const categoryBanner = document.getElementById("category-banner");
const categoryBannerImg = document.getElementById("category-banner-img");

const modalCart = document.getElementById("modal-cart");

const viewShop = document.getElementById("view-shop");
const viewAbout = document.getElementById("view-about");
const ALL_VIEWS = [viewShop, viewAbout];

function showView(view) {
	ALL_VIEWS.forEach(v => { v.hidden = v !== view; });
	window.scrollTo({ top: 0, behavior: "smooth" });
}

/* BÚSQUEDA, CATEGORÍAS Y ORDEN — RENDER DE PRODUCTOS */
function getFilteredProducts() {
	let list = PRODUCTS.filter(p => p.active !== false);

	if (state.search.trim() !== "") {
		const q = state.search.trim().toLowerCase();
		list = list.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
	} else if (state.activeCategory === "promo") {
		list = list.filter(p => p.promo);
	} else if (state.activeCategory !== "todos") {
		list = list.filter(p => p.category === state.activeCategory);
	}

	switch (state.sort) {
		case "popular":
			list.sort((a, b) => (b.sales || 0) - (a.sales || 0));
			break;
		case "price-asc":
			list.sort((a, b) => a.price - b.price);
			break;
		case "price-desc":
			list.sort((a, b) => b.price - a.price);
			break;
		case "name-asc":
			list.sort((a, b) => a.name.localeCompare(b.name));
			break;
		case "name-desc":
			list.sort((a, b) => b.name.localeCompare(a.name));
			break;
		case "newest":
			list.sort((a, b) => new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0));
			break;
		case "oldest":
			list.sort((a, b) => new Date(a.dateAdded || 0) - new Date(b.dateAdded || 0));
			break;
		default:
			// "relevancia": destacados primero, luego el orden original
			list.sort((a, b) => (b.featured === true) - (a.featured === true));
	}

	return list;
}

function formatPrice(value) {
	return `${CONFIG.moneda} ${Number(value).toLocaleString("es-CO")}`;
}

/* Actualiza el título de la sección + contador de resultados + banner de
   categoría. Separado de renderProducts() para que cada función tenga una
   sola responsabilidad. */
function updateResultsHeader(products) {
	const searching = state.search.trim() !== "";

	if (searching) {
		categoryTitle.textContent = `Resultados de "${state.search.trim()}"`;
	} else if (state.activeCategory === "todos") {
		categoryTitle.textContent = "Todos los productos";
	} else if (state.activeCategory === "promo") {
		categoryTitle.textContent = "Solo promoción";
	} else {
		categoryTitle.textContent = state.activeCategory;
	}
	resultsCount.textContent = `${products.length} resultado${products.length === 1 ? "" : "s"} encontrado${products.length === 1 ? "" : "s"}`;

	const activeCat = CATEGORIES.find(c => c.name === state.activeCategory);
	if (activeCat && activeCat.image && !searching) {
		categoryBannerImg.src = activeCat.image;
		categoryBannerImg.alt = activeCat.name;
		categoryBanner.hidden = false;
	} else {
		categoryBanner.hidden = true;
	}
}

/* Arma el HTML de una sola tarjeta de producto. Aislar esto de
   renderProducts() facilita reutilizarlo y mantenerlo si cambia el diseño
   de la tarjeta más adelante. */
function buildProductCard(product) {
	const isFav = state.favorites.includes(product.id);
	const card = document.createElement("article");
	card.className = "card";
	card.innerHTML = `
		<div class="card__image-wrap">
			<img src="${product.image}" alt="${product.name}" loading="lazy">
			${product.promo ? `<span class="card__badge">Promoción</span>` : ""}
			${product.featured ? `<span class="card__badge card__badge--featured">Destacado</span>` : ""}
			<button class="card__fav ${isFav ? "is-active" : ""}" data-fav="${product.id}" aria-label="Favorito">
				<svg viewBox="0 0 24 24" fill="${isFav ? "currentColor" : "none"}" stroke="currentColor" stroke-width="1.6">
					<path d="M12 21s-7.5-4.7-10-9.1C.5 8.4 2.3 5 5.8 5c2 0 3.4 1.1 4.2 2.3C10.8 6.1 12.2 5 14.2 5c3.5 0 5.3 3.4 3.8 6.9C19.5 16.3 12 21 12 21z"/>
				</svg>
			</button>
		</div>
		<div class="card__body">
			<span class="card__category">${product.category}</span>
			<h3 class="card__name">${product.name}</h3>
			${product.description ? `<p class="card__description">${product.description}</p>` : ""}
			<div class="card__price-row">
				<span class="card__price">${formatPrice(product.price)}</span>
				${product.oldPrice ? `<span class="card__price--old">${formatPrice(product.oldPrice)}</span>` : ""}
			</div>
			<button class="card__add" data-add="${product.id}">Añadir a la bolsa</button>
		</div>
	`;
	return card;
}

function renderProducts() {
	const products = getFilteredProducts();

	emptyState.hidden = products.length !== 0;
	emptyState.textContent = state.search.trim() !== ""
		? `No se encontraron resultados para "${state.search.trim()}"`
		: "Ningún producto encontrado";

	updateResultsHeader(products);

	// Se arma todo en un DocumentFragment y se inserta una sola vez, en vez
	// de tocar el DOM (appendChild) producto por producto — con 100+
	// productos esto evita un reflow por cada tarjeta.
	const fragment = document.createDocumentFragment();
	products.forEach(product => fragment.appendChild(buildProductCard(product)));
	grid.innerHTML = "";
	grid.appendChild(fragment);
}

/* CATEGORÍAS (sidebar desktop + menú hamburguesa móvil) */
function categoryCount(categoryName) {
	return PRODUCTS.filter(p => p.active !== false && p.category === categoryName).length;
}

function renderCategoriesUI() {
	const totalActive = PRODUCTS.filter(p => p.active !== false).length;
	const totalPromo = PRODUCTS.filter(p => p.active !== false && p.promo).length;

	const items = [
		{ key: "todos", name: "Todos los productos", emoji: "🛍️", count: totalActive },
		{ key: "promo", name: "Solo promoción", emoji: "🏷️", count: totalPromo },
		...CATEGORIES.map(c => ({ key: c.name, name: c.name, emoji: c.emoji, image: c.image, count: categoryCount(c.name) })),
	];

	const renderList = (target, isDrawer) => {
		if (!target) return;
		target.innerHTML = "";
		items.forEach(item => {
			const isActive = state.activeCategory === item.key;
			const el = document.createElement(isDrawer ? "button" : "li");
			if (isDrawer) {
				el.type = "button";
				el.className = isActive ? "is-active" : "";
				el.dataset.category = item.key;
				el.dataset.closeDrawer = "";
				el.innerHTML = `<span>${item.emoji || "🎀"}</span><span>${item.name}</span>`;
			} else {
				el.innerHTML = `
					<button class="category-item ${isActive ? "is-active" : ""}" data-category="${item.key}">
						<span class="category-item__thumb">${item.image ? `<img src="${item.image}" alt="${item.name}">` : (item.emoji || "🎀")}</span>
						<span class="category-item__name">${item.name}</span>
						<span class="category-item__count">${item.count}</span>
					</button>
				`;
			}
			target.appendChild(el);
		});
	};

	renderList(categoriesList, false);
	renderList(drawerCategories, true);
}

function selectCategory(key) {
	state.activeCategory = key;
	state.search = "";
	if (searchInput) searchInput.value = "";
	if (searchInputMobile) searchInputMobile.value = "";
	if (searchClearBtn) searchClearBtn.hidden = true;
	renderCategoriesUI();
	renderProducts();
}

if (categoriesList) {
	categoriesList.addEventListener("click", (e) => {
		const btn = e.target.closest("[data-category]");
		if (!btn) return;
		selectCategory(btn.dataset.category);
	});
}

if (drawerCategories) {
	drawerCategories.addEventListener("click", (e) => {
		const btn = e.target.closest("[data-category]");
		if (!btn) return;
		selectCategory(btn.dataset.category);
		closeNavDrawer();
	});
}

if (sortSelect) {
	sortSelect.addEventListener("change", (e) => {
		state.sort = e.target.value;
		renderProducts();
	});
}

/* 
   BUSCADOR (escritorio + móvil)
   Todo este bloque está DESACOPLADO del resto de la tienda: cada elemento
   se busca de forma independiente y se comprueba que exista antes de
   usarlo. Si en el futuro se elimina o modifica la barra de búsqueda móvil
   (o la de escritorio), el resto de la tienda —categorías, productos,
   carrito, menú— sigue funcionando con total normalidad.
*/
const searchInput = document.getElementById("search-input");
const searchInputMobile = document.getElementById("search-input-mobile");
const searchClearBtn = document.getElementById("search-clear");
const mobileSearchBar = document.getElementById("mobile-search");

function runSearch(value) {
	state.search = value || "";
	if (searchClearBtn) searchClearBtn.hidden = state.search.trim() === "";
	renderProducts();
}

const searchBtnDesktop = document.getElementById("search-btn");
if (searchBtnDesktop && searchInput) {
	searchBtnDesktop.addEventListener("click", () => runSearch(searchInput.value));
	searchInput.addEventListener("input", () => runSearch(searchInput.value));
	searchInput.addEventListener("keydown", (e) => { if (e.key === "Enter") runSearch(searchInput.value); });
}

const searchBtnMobile = document.getElementById("search-btn-mobile");
if (searchBtnMobile && searchInputMobile) {
	searchBtnMobile.addEventListener("click", () => runSearch(searchInputMobile.value));
	searchInputMobile.addEventListener("input", () => runSearch(searchInputMobile.value));
	searchInputMobile.addEventListener("keydown", (e) => { if (e.key === "Enter") runSearch(searchInputMobile.value); });
}

if (searchClearBtn) {
	searchClearBtn.addEventListener("click", () => {
		if (searchInput) searchInput.value = "";
		if (searchInputMobile) searchInputMobile.value = "";
		runSearch("");
	});
}

/* Botón de lupa en móvil: muestra/oculta la barra de búsqueda (si existe) */
const searchToggleBtn = document.getElementById("search-toggle");
if (searchToggleBtn && mobileSearchBar) {
	searchToggleBtn.addEventListener("click", () => {
		mobileSearchBar.hidden = !mobileSearchBar.hidden;
		if (!mobileSearchBar.hidden && searchInputMobile) searchInputMobile.focus();
	});
}

/* MENÚ HAMBURGUESA (drawer lateral móvil) */
const navDrawer = document.getElementById("nav-drawer");
const navDrawerOverlay = document.getElementById("nav-drawer-overlay");
const navToggle = document.getElementById("nav-toggle");

function openNavDrawer() {
	if (!navDrawer) return;
	navDrawer.classList.add("is-open");
	navDrawer.setAttribute("aria-hidden", "false");
	if (navDrawerOverlay) navDrawerOverlay.hidden = false;
	if (navToggle) navToggle.setAttribute("aria-expanded", "true");
}

function closeNavDrawer() {
	if (!navDrawer) return;
	navDrawer.classList.remove("is-open");
	navDrawer.setAttribute("aria-hidden", "true");
	if (navDrawerOverlay) navDrawerOverlay.hidden = true;
	if (navToggle) navToggle.setAttribute("aria-expanded", "false");
}

if (navToggle) navToggle.addEventListener("click", openNavDrawer);
const navDrawerCloseBtn = document.getElementById("nav-drawer-close");
if (navDrawerCloseBtn) navDrawerCloseBtn.addEventListener("click", closeNavDrawer);
if (navDrawerOverlay) navDrawerOverlay.addEventListener("click", closeNavDrawer);

if (navDrawer) {
	navDrawer.querySelectorAll("[data-close-drawer]").forEach(el => {
		el.addEventListener("click", () => {
			if (!el.hasAttribute("data-category")) closeNavDrawer();
		});
	});
}

const drawerCartBtn = document.getElementById("drawer-cart");
if (drawerCartBtn) {
	drawerCartBtn.addEventListener("click", () => {
		closeNavDrawer();
		renderCart();
		showModal(modalCart);
	});
}

/* Desplazamiento suave a una sección (usado por "Productos" en el drawer) */
document.querySelectorAll("[data-scroll-to]").forEach(el => {
	el.addEventListener("click", (e) => {
		e.preventDefault();
		showView(viewShop);
		setTimeout(() => {
			document.getElementById(el.dataset.scrollTo)?.scrollIntoView({ behavior: "smooth" });
		}, 50);
	});
});

/* CARRITO DE COMPRA (sin necesidad de registro ni inicio de sesión) */
function addToCart(productId) {
	const existing = state.cart.find(i => i.id === productId);
	if (existing) {
		existing.qty += 1;
	} else {
		state.cart.push({ id: productId, qty: 1 });
	}
	persistCart();
	updateCartCount();
	renderCart();
	showModal(modalCart);
}

function updateCartCount() {
	const total = state.cart.reduce((sum, i) => sum + i.qty, 0);
	cartCountEl.textContent = total;
}

function renderCart() {
	const wrap = document.getElementById("cart-items");
	const emptyMsg = document.getElementById("cart-empty");
	const totalEl = document.getElementById("cart-total-value");
	const itemsCountEl = document.getElementById("cart-items-count");

	wrap.innerHTML = "";
	emptyMsg.hidden = state.cart.length !== 0;

	let total = 0;
	let itemsCount = 0;

	state.cart.forEach(item => {
		const product = PRODUCTS.find(p => p.id === item.id);
		if (!product) return;
		total += product.price * item.qty;
		itemsCount += item.qty;

		const row = document.createElement("div");
		row.className = "cart-item";
		row.innerHTML = `
			<img src="${product.image}" alt="${product.name}">
			<div class="cart-item__info">
				<div class="cart-item__name">${product.name}</div>
				<div class="cart-item__qty">
					<button data-qty="down" data-id="${item.id}">−</button>
					<span>${item.qty}</span>
					<button data-qty="up" data-id="${item.id}">+</button>
				</div>
			</div>
			<div>
				<div class="cart-item__price">${formatPrice(product.price * item.qty)}</div>
				<button class="cart-item__remove" data-remove="${item.id}">Eliminar</button>
			</div>
		`;
		wrap.appendChild(row);
	});

	totalEl.textContent = formatPrice(total);
	itemsCountEl.textContent = itemsCount;
}

document.getElementById("cart-items").addEventListener("click", (e) => {
	const id = e.target.dataset.id || e.target.dataset.remove;
	if (e.target.dataset.qty === "up") {
		state.cart.find(i => i.id === id).qty += 1;
	} else if (e.target.dataset.qty === "down") {
		const item = state.cart.find(i => i.id === id);
		item.qty -= 1;
		if (item.qty <= 0) state.cart = state.cart.filter(i => i.id !== id);
	} else if (e.target.dataset.remove) {
		state.cart = state.cart.filter(i => i.id !== e.target.dataset.remove);
	}
	persistCart();
	updateCartCount();
	renderCart();
});

document.getElementById("btn-cart").addEventListener("click", () => {
	renderCart();
	showModal(modalCart);
});
document.getElementById("cart-close").addEventListener("click", () => hideModal(modalCart));
document.getElementById("cart-continue").addEventListener("click", () => hideModal(modalCart));

/* Añadir al carrito y marcar favoritos: no requieren iniciar sesión */
grid.addEventListener("click", (e) => {
	const addBtn = e.target.closest("[data-add]");
	const favBtn = e.target.closest("[data-fav]");

	if (addBtn) addToCart(addBtn.dataset.add);

	if (favBtn) {
		const id = favBtn.dataset.fav;
		if (state.favorites.includes(id)) {
			state.favorites = state.favorites.filter(f => f !== id);
		} else {
			state.favorites.push(id);
		}
		persistCart();
		renderProducts();
	}
});

/* Finalizar compra por WhatsApp: arma el mensaje con el resumen del pedido */
function goToWhatsappCheckout() {
	if (state.cart.length === 0) return;

	const lines = state.cart.map(item => {
		const product = PRODUCTS.find(p => p.id === item.id);
		return `- ${item.qty}x ${product.name} — ${formatPrice(product.price * item.qty)}`;
	});
	const totalProductos = state.cart.reduce((sum, i) => sum + i.qty, 0);
	const total = state.cart.reduce((sum, item) => {
		const product = PRODUCTS.find(p => p.id === item.id);
		return sum + product.price * item.qty;
	}, 0);

	const message =
		`Hola, ${CONFIG.nombreEmpresa}.%0A%0AQuiero realizar el siguiente pedido:%0A%0A${lines.join("%0A")}` +
		`%0A%0ATotal de productos: ${totalProductos}%0ATotal: ${formatPrice(total)}%0A%0AQuedo atento/a para continuar con la compra.`;

	window.open(`https://wa.me/${CONFIG.whatsappNumero}?text=${message}`, "_blank");
}

document.getElementById("cart-checkout").addEventListener("click", goToWhatsappCheckout);

/* MODALES: */
function showModal(modal) { modal.hidden = false; }
function hideModal(modal) { modal.hidden = true; }

[modalCart].forEach(modal => {
	modal.addEventListener("click", (e) => { if (e.target === modal) hideModal(modal); });
});

/* NAVEGACIÓN ENTRE VISTAS PÚBLICAS (Tienda / Sobre) */
document.querySelectorAll("[data-view-link]").forEach(link => {
	link.addEventListener("click", (e) => {
		e.preventDefault();
		const target = link.dataset.viewLink;
		showView(target === "about" ? viewAbout : viewShop);
	});
});

/* 
   ACCESO ADMINISTRATIVO (discreto, a través del logo)
   El panel administrativo vive por completo en un archivo aparte
   (dashboard.html / dashboard.css / dashboard.js) y requiere su propio
   inicio de sesión — ver ese archivo y el README para más detalles.
   Aquí solo se detecta la interacción discreta sobre el logo:
     - Escritorio: doble clic sobre el logo.
     - Móvil: mantener presionado el logo (~700ms).
   Un clic normal en el logo sigue llevando a la tienda con normalidad.
*/
const brandLink = document.querySelector(".brand");
if (brandLink) {
	brandLink.addEventListener("dblclick", (e) => {
		e.preventDefault();
		window.location.href = "dashboard.html";
	});

	let pressTimer = null;
	brandLink.addEventListener("touchstart", () => {
		pressTimer = setTimeout(() => { window.location.href = "dashboard.html"; }, 700);
	});
	brandLink.addEventListener("touchend", () => clearTimeout(pressTimer));
	brandLink.addEventListener("touchmove", () => clearTimeout(pressTimer));
}

/* APLICAR INFORMACIÓN DE LA TIENDA AL RESTO DE LA PÁGINA */
function applyStoreInfoToPage() {
	document.title = CONFIG.nombreEmpresa;
	document.querySelectorAll(".brand__name").forEach(el => { el.textContent = CONFIG.nombreEmpresa; });
	document.getElementById("hero-tagline").textContent = CONFIG.tagline;
	document.getElementById("footer-tagline").textContent = CONFIG.tagline;

	document.getElementById("footer-email").href = `mailto:${CONFIG.email}`;
	document.getElementById("footer-email").textContent = CONFIG.email;
	document.getElementById("footer-phone").textContent = `+${CONFIG.whatsappNumero}`;

	document.getElementById("footer-tiktok").href = CONFIG.tiktok;
	document.getElementById("footer-instagram").href = CONFIG.instagram;

	const whatsappMsg = encodeURIComponent(CONFIG.whatsappMensaje);
	document.getElementById("whatsapp-float").href = `https://wa.me/${CONFIG.whatsappNumero}?text=${whatsappMsg}`;

	document.getElementById("footer-copyright").textContent = `© ${new Date().getFullYear()} ${CONFIG.nombreEmpresa}. Todos los derechos reservados.`;
}

/* INICIALIZACIÓN */
function saveInitialDataIfNeeded() {
	// Garantiza que dashboard.html siempre tenga datos para leer en localStorage,
	// incluso si el administrador entra al panel antes de visitar la tienda.
	if (!localStorage.getItem("store_config")) localStorage.setItem("store_config", JSON.stringify(CONFIG));
	if (!localStorage.getItem("store_categories")) localStorage.setItem("store_categories", JSON.stringify(CATEGORIES));
	if (!localStorage.getItem("store_products")) localStorage.setItem("store_products", JSON.stringify(PRODUCTS));
}

function init() {
	saveInitialDataIfNeeded();
	applyStoreInfoToPage();
	renderCategoriesUI();
	renderProducts();
	updateCartCount();
}

init();
