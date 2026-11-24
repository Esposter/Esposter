import { RoutePathValues } from "#src/services/oxlint/routing/RoutePathValues";

// Whether a string spells a route: one of `RoutePath`'s paths as it is, or an absolute address whose path is one
// (`https://host/genshin`). A longer path holding a route's name (`openspec/specs/genshin/README.md`) is a page of its
// Own. An address with no base has a scheme, so a string with no colon is never parsed as one
export const checkIsRouteSpelling = (value: string): boolean => {
  if (RoutePathValues.has(value)) return true;
  else if (!value.includes(":")) return false;
  const pathname = URL.parse(value)?.pathname;
  return pathname !== undefined && RoutePathValues.has(pathname);
};
