const LOCALE = "es-PA";

const currency = new Intl.NumberFormat(LOCALE, { style: "currency", currency: "USD" });
const currencyWhole = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const currencyCompact = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});
const integer = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 });
const decimal = new Intl.NumberFormat(LOCALE, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const oneDecimal = new Intl.NumberFormat(LOCALE, {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const percent = new Intl.NumberFormat(LOCALE, { style: "percent", maximumFractionDigits: 1 });
const dateTime = new Intl.DateTimeFormat(LOCALE, { dateStyle: "medium", timeStyle: "short" });

/** Montos enteros sin centavos (USD 10,410); promedios con dos decimales (USD 59.76). */
export const formatCurrency = (value: number) =>
  Number.isInteger(value) ? currencyWhole.format(value) : currency.format(value);
export const formatCurrencyCompact = (value: number) => currencyCompact.format(value);
export const formatInteger = (value: number) => integer.format(value);
export const formatDecimal = (value: number) => decimal.format(value);
export const formatRating = (value: number) => oneDecimal.format(value);
/** Recibe un porcentaje en escala 0–100 (como lo devuelve la API). */
export const formatPercent = (value: number) => percent.format(value / 100);
export const formatDateTime = (iso: string) => dateTime.format(new Date(iso));
export const formatDuration = (ms: number) =>
  ms < 1000 ? `${integer.format(ms)} ms` : `${decimal.format(ms / 1000)} s`;
