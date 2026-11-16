import { getSegmentPattern } from "#src/services/getSegmentPattern";
import { splitSegments } from "#src/services/splitSegments";

// A route that matches every path would deny the shell its own navigations, so it adds nothing to the denylist
const CATCH_ALL_ROUTES: ReadonlySet<string> = new Set(["", "/", "/**"]);

/**
 * The paths a navigation must not be answered with the app shell for: the server's own routes, which the worker would
 * otherwise swallow into the cached page. Each route becomes one anchored pattern, so `/api/**` denies `/api` and what
 * is under it but never `/apiary`, and the list is deduplicated and sorted so the generated worker is the same on every
 * build.
 */
export const getNavigationDenylist = (routes: readonly string[], baseURL: string): RegExp[] => {
  const baseSegments = splitSegments(baseURL);
  const sources = new Set(
    routes
      .filter((route) => !CATCH_ALL_ROUTES.has(route))
      .map(
        (route) =>
          `^${[...baseSegments.map((segment) => RegExp.escape(`/${segment}`)), ...splitSegments(route).map((segment) => getSegmentPattern(segment))].join("")}$`,
      ),
  );
  return [...sources].toSorted().map((source) => new RegExp(source, "u"));
};
