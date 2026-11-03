// A route that matches every path would deny the shell its own navigations, so it adds nothing to the denylist
const CATCH_ALL_ROUTES: ReadonlySet<string> = new Set(["", "/", "/**"]);
const MULTI_SEGMENT_WILDCARD = "**";
const MULTI_SEGMENT_PATTERN = "(?:/.*)?";
const SINGLE_SEGMENT_PATTERN = "/[^/]+";

const getSegmentPattern = (segment: string): string => {
  if (segment.startsWith(MULTI_SEGMENT_WILDCARD)) return MULTI_SEGMENT_PATTERN;
  if (segment.startsWith(":") || segment.startsWith("*")) return SINGLE_SEGMENT_PATTERN;
  // The leading slash is what `RegExp.escape` escapes, so the segment's own first character is never rewritten as a hex escape
  return RegExp.escape(`/${segment}`);
};

const splitSegments = (path: string): string[] => path.split("/").filter(Boolean);

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
