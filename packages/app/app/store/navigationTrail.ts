import type { NavigationTrailPage } from "@/models/shared/NavigationTrailPage";

import { NavigationTrailPageMap } from "@/services/shared/NavigationTrailPageMap";

// The pages the visitor came through to reach the one they are on. Rendered as the breadcrumb, and read by the
// Resource page to decide whether it is a drill-down (list rail beside the blade) or a direct arrival.
//
// The plugin keeps this in step with the browser's history entries, so back, forward and a refresh all restore
// The trail that entry was left with. See /docs/platform/breadcrumb-trail
export const useNavigationTrailStore = defineStore("navigationTrail", () => {
  const trail = ref<NavigationTrailPage[]>([]);
  // Each crumb is a plain path: it is a page, not a state, and the trail it lands with is recomputed from the
  // Navigation itself — going up truncates rather than re-deriving an ancestry nobody walked
  const crumbs = computed(() => trail.value.map((page) => NavigationTrailPageMap[page]));
  const setTrail = (newTrail: NavigationTrailPage[]) => {
    trail.value = newTrail;
  };
  return { crumbs, setTrail, trail };
});
