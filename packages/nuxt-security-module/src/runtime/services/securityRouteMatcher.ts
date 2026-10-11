import type { SecurityRules } from "#src/models/SecurityRules";
import type { RouterContext } from "rou3";

import { addRoute, createRouter, findAllRoutes } from "rou3";

// Built once, when the route rules are resolved at startup, and read by every request after.
// The router holds each pattern's rules as they were resolved, so a request never copies them to match its path
let securityRouter: RouterContext<SecurityRules> | undefined;

export const setSecurityRouteMatcher = (routes: Record<string, SecurityRules>): void => {
  const router = createRouter<SecurityRules>();
  for (const [pattern, rules] of Object.entries(routes)) addRoute(router, "", pattern, rules);
  securityRouter = router;
};

// The rules of every pattern that matches the path, the least specific first, `undefined` before startup has run
export const findSecurityRules = (pathname: string): SecurityRules[] | undefined =>
  securityRouter && findAllRoutes(securityRouter, "", pathname).flatMap(({ data }) => (data ? [data] : []));
