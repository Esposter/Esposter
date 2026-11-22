import type { ModuleOptions } from "#src/models/ModuleOptions";

// The source that stands for the empty list: a directive that allows nothing
export const NONE_SOURCE = "'none'";
// The server middleware an option registers under its own name, in the order the chain runs them
export const SERVER_MIDDLEWARE_OPTIONS = [
  "csrf",
  "rateLimiter",
  "requestSizeLimiter",
  "corsHandler",
  "allowedMethodsRestricter",
] as const satisfies readonly (keyof ModuleOptions)[];
