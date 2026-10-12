import type { ModuleOptions } from "#src/models/ModuleOptions";

// The options that apply to one request, after every route rule whose pattern matches its path is merged
export type SecurityRules = Partial<ModuleOptions>;
