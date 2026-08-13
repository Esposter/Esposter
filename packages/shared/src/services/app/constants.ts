export const MAX_READ_LIMIT = 1000;
export const SITE_NAME = "Esposter";
// The binary byte units, derived rather than written as literals so the relationship between them is the
// Definition. Every runtime realm that formats or budgets bytes reads them from here; `@esposter/configuration`
// Keeps its own copy because it is build tooling the app runtime must not depend on
export const KIBIBYTE: number = 2 ** 10;
export const MEGABYTE: number = KIBIBYTE ** 2;
export const GIBIBYTE: number = MEGABYTE * KIBIBYTE;
