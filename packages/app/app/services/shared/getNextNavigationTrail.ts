import type { NavigationTrailCrumb } from "@/models/shared/NavigationTrailCrumb";

import { NavigationTrailPage } from "@/models/shared/NavigationTrailPage";
import { NavigationTrailPageMap } from "@/services/shared/NavigationTrailPageMap";
import { RoutePath } from "@esposter/shared";

const NAVIGATION_TRAIL_PAGE_ENTRIES = Object.entries(NavigationTrailPageMap) as [
  NavigationTrailPage,
  NavigationTrailCrumb,
][];
// A page absent from the map can be navigated from without ever becoming a crumb — that is how a page opts out
const getPage = (path: string) => NAVIGATION_TRAIL_PAGE_ENTRIES.find(([, crumb]) => crumb.path === path)?.[0];
// A page and its own sub-views (a resource and its blades) share these leading segments, which is what tells a
// Blade switch apart from a navigation to somewhere else
const getPageKey = (path: string) => path.split("/").slice(0, 3).join("/");

// Where a navigation leaves the trail — the whole model, as one pure function, so it is testable without a
// Browser and the plugin only has to decide when to ask. See /docs/platform/breadcrumb-trail
export const getNextNavigationTrail = (
  fromPath: string,
  toPath: string,
  trail: NavigationTrailPage[],
): NavigationTrailPage[] => {
  // Outside the area nothing carries a trail, and the landing page is where one starts. The `/` is what makes
  // It a path boundary: a sibling route that merely shares the prefix is a different area, not a page inside it
  if (!toPath.startsWith(`${RoutePath.Resources}/`)) return [];

  const toPage = getPage(toPath);
  const toPageIndex = toPage ? trail.indexOf(toPage) : -1;
  // Going back up to a page already on the trail truncates it, however the visitor got there — a crumb, or a
  // Page's own close affordance
  if (toPageIndex !== -1) return trail.slice(0, toPageIndex);

  const fromPage = getPage(fromPath);
  // Drilling in from a page that can be a crumb appends it; moving between views of the page already open
  // Carries its trail through; anything else is a direct arrival, with nothing above it
  if (fromPage) return [...trail, fromPage];
  else if (getPageKey(toPath) === getPageKey(fromPath)) return trail;
  return [];
};
