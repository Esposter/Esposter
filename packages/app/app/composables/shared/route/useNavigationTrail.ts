import { NavigationTrailPage } from "@/models/shared/NavigationTrailPage";
import { NavigationTrailPageMap } from "@/services/shared/NavigationTrailPageMap";

const NAVIGATION_TRAIL_SEPARATOR = ",";
const NAVIGATION_TRAIL_PAGES: readonly string[] = Object.values(NavigationTrailPage);

// The trail lives entirely in the url's `trail` query, so a refresh, a restored tab and a shared link all
// Rebuild the same breadcrumb — nothing is remembered anywhere else. Unknown slugs are dropped rather than
// Rendered: the value is visitor-editable, and a crumb is a link we are about to offer them.
// See /docs/platform/breadcrumb-trail
export const useNavigationTrail = () => {
  const route = useRoute();
  const trail = computed(() =>
    String(route.query.trail ?? "")
      .split(NAVIGATION_TRAIL_SEPARATOR)
      .filter((slug): slug is NavigationTrailPage => NAVIGATION_TRAIL_PAGES.includes(slug)),
  );
  // Each crumb links back with the part of the trail that led to it, so going up truncates rather than
  // Dropping the visitor onto a page that has forgotten how they got there
  const crumbs = computed(() =>
    trail.value.map((page, index) => {
      const { path, title } = NavigationTrailPageMap[page];
      const ancestors = trail.value.slice(0, index);
      return {
        title,
        to: { path, query: ancestors.length > 0 ? { trail: ancestors.join(NAVIGATION_TRAIL_SEPARATOR) } : {} },
      };
    }),
  );
  // The query a link out of this page carries so the page it lands on can render the way back. Re-entering the
  // Page already at the end of the trail (the list box picking another resource) extends nothing
  const getTrailQuery = (page: NavigationTrailPage) => ({
    trail: (trail.value.at(-1) === page ? trail.value : [...trail.value, page]).join(NAVIGATION_TRAIL_SEPARATOR),
  });
  return { crumbs, getTrailQuery, trail };
};
