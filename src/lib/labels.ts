// Traducciones para la UI. Los datos se guardan con los valores originales del dataset.

export const CATEGORY_LABELS: Record<string, string> = {
  Accessories: "Accesorios",
  Clothing: "Ropa",
  Footwear: "Calzado",
  Outerwear: "Abrigos",
};

export const SEASON_LABELS: Record<string, string> = {
  Spring: "Primavera",
  Summer: "Verano",
  Fall: "Otoño",
  Winter: "Invierno",
};

export const GENDER_LABELS: Record<string, string> = { Female: "Mujer", Male: "Hombre" };

export const REGION_LABELS: Record<string, string> = {
  Northeast: "Noreste",
  Midwest: "Medio Oeste",
  South: "Sur",
  West: "Oeste",
};

export const PAYMENT_LABELS: Record<string, string> = {
  "Bank Transfer": "Transferencia",
  Cash: "Efectivo",
  "Credit Card": "Tarjeta de crédito",
  "Debit Card": "Tarjeta de débito",
  PayPal: "PayPal",
  Venmo: "Venmo",
};

export const label = (map: Record<string, string>, value: string) => map[value] ?? value;
