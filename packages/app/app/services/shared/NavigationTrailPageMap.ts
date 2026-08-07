import type { NavigationTrailCrumb } from "@/models/shared/NavigationTrailCrumb";

import { NavigationTrailPage } from "@/models/shared/NavigationTrailPage";
import { RoutePath } from "@esposter/shared";

// What each trail slug renders as. The title lives here rather than in the url, so a crumb can be renamed
// Without invalidating every link already sent around.
export const NavigationTrailPageMap = {
  [NavigationTrailPage.All]: { path: RoutePath.ResourcesAll, title: "All" },
  [NavigationTrailPage.Resources]: { path: RoutePath.Resources, title: "Resources" },
} as const satisfies Record<NavigationTrailPage, NavigationTrailCrumb>;
