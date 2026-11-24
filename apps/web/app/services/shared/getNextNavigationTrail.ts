import { NavigationTrailPage } from "#src/models/shared/NavigationTrailPage";
import { NavigationTrailPageMap } from "#src/services/shared/NavigationTrailPageMap";
import { RoutePath } from "@esposter/shared";

// A page absent from the map can be navigated from without ever becoming a crumb, which is how a page opts out.
// Pages are walked through their own value set.
// So each is indexed as the page it is rather than as an `Object.entries` string.
const getPage = (path: string) =>
  Object.values(NavigationTrailPage).find((page) => NavigationTrailPageMap[page].path === path);
// A page and its own sub-views (a resource and its blades) share these leading segments.
// That is what tells moving around inside one page apart from leaving it for another.
const getPageKey = (path: string) => path.split("/").slice(0, 3).join("/");
// The model of where a navigation leaves the trail is one pure function, so it is testable without a browser.
// The plugin only has to decide when to ask.
// Every branch returns a fresh plain array, never the one it was handed.
// The caller writes the result onto the history entry, which the browser structured-clones.
// The trail it passes in is the store's own reactive array, a proxy the serializer rejects outright.
// See openspec/specs/resource/breadcrumb-trail/design.md
export const getNextNavigationTrail = (fromPath: string, toPath: string, trail: readonly NavigationTrailPage[]) => {
  // Outside the area nothing carries a trail, and the landing page is where one starts.
  // The `/` is what makes it a path boundary.
  // A sibling route that merely shares the prefix is a different area, not a page inside it.
  if (!toPath.startsWith(`${RoutePath.ResourceExplorer}/`)) return [];

  const toPage = getPage(toPath);
  const toPageIndex = toPage ? trail.indexOf(toPage) : -1;
  // Going back up to a page already on the trail truncates it, however the visitor got there.
  // That is a crumb, or a page's own close affordance.
  if (toPageIndex !== -1) return trail.slice(0, toPageIndex);

  const fromPage = getPage(fromPath);
  // Only leaving a page that can be a crumb is a drill-in from it, so only that appends.
  // Every other navigation carries the trail through untouched.
  // That covers another blade, another resource opened beside it, or the same page re-entered with different filters.
  // One arriving from outside the area carries the empty trail that leaving it left behind, as a direct arrival does.
  if (fromPage && getPageKey(fromPath) !== getPageKey(toPath)) return [...trail, fromPage];
  else return [...trail];
};
