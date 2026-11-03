import type { Nitro } from "nitro/types";

// A navigation is a GET, so a route that answers only another method never needs the shell denied for it. The routes
// Are the server's own, relative to the base URL, which the denylist prefixes
export const getNitroNavigationRoutes = ({ routing }: Pick<Nitro, "routing">): string[] =>
  routing.routes.routes
    .filter(({ method }) => method === "" || method.toUpperCase() === "GET")
    .map(({ route }) => route);
