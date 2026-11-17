import type { ModuleOptions } from "#src/models/ModuleOptions";

// The options one route rule's `security` key may set, which the module reads when the rules are resolved at build time.
// The basic auth credentials are refused there, as a route rule is read by every request.
// The options that apply to one request are these, after every route rule whose pattern matches its path is merged
export type SecurityRules = Partial<ModuleOptions>;
