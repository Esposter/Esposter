export const MAX_READ_LIMIT = 1000;
export const SITE_NAME = "Esposter";
// The binary byte units, derived rather than written as literals so the relationship between them is the
// Definition. Every runtime realm that formats or budgets bytes reads them from here; `@esposter/configuration`
// Keeps its own copy because it is build tooling the app runtime must not depend on, and `packages/app` keeps
// One because its copy is read by `nuxt.config` and importing this barrel there drags the whole runtime graph
// Into config evaluation. `MEGABYTE` is unexported: it is only the derivation step between the two units
// That do have consumers.
export const KIBIBYTE: number = 2 ** 10;
const MEGABYTE: number = KIBIBYTE ** 2;
export const GIBIBYTE: number = MEGABYTE * KIBIBYTE;
