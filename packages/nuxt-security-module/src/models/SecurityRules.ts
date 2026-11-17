import type { ModuleOptions } from "#src/models/ModuleOptions";

// The options one route rule's `security` key may set
// The options that apply to one request are these, after every route rule whose pattern matches its path is merged
export type SecurityRules = Partial<ModuleOptions>;
