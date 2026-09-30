import { RoutePath } from "@esposter/shared";

// Every page path `RoutePath` names, read off it rather than listed, so a route added there is held here too. The
// Root ("/") is left out, since a bare slash is as often a separator as a page, and so is an address off the site
export const RoutePathValues: ReadonlySet<string> = new Set(
  Object.values(RoutePath).flatMap((value) =>
    typeof value === "string" && value.startsWith("/") && value.length > 1 ? [value] : [],
  ),
);
