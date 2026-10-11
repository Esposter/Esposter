import type { SecurityRules } from "#src/models/SecurityRules";

// The build's route rules as the module's virtual module, one entry per route pattern.
// The basic auth credentials are left out.
// They belong in the server-only runtime config, not in a route rule any code can read.
export const getRouteRulesTemplate = (routes: Record<string, SecurityRules>): string =>
  `export default ${JSON.stringify(routes)}\n`;
