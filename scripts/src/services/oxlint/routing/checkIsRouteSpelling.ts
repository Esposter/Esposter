import { RoutePathValues } from "#src/services/oxlint/routing/RoutePathValues";

// Whether a string spells a route: one of `RoutePath`'s paths as it is, or an absolute address whose path is one
// (`https://host/genshin`). A longer path holding a route's name (`/docs/genshin`) is a page of its own
export const checkIsRouteSpelling = (value: string): boolean =>
  RoutePathValues.has(value) || (URL.canParse(value) && RoutePathValues.has(new URL(value).pathname));
