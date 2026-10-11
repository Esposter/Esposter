import type { ModuleOptions } from "#src/models/ModuleOptions";

// The options one route rule's `security` key may set. The basic auth credentials are refused at build, as a route rule is read by every request
export type SecurityRouteRules = Partial<ModuleOptions>;
