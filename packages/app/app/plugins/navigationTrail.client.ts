import { NavigationTrailPage } from "@/models/shared/NavigationTrailPage";
import { getNextNavigationTrail } from "@/services/shared/getNextNavigationTrail";
import { useNavigationTrailStore } from "@/store/navigationTrail";

const NAVIGATION_TRAIL_PAGES: readonly string[] = Object.values(NavigationTrailPage);
// An entry can predate this release or have been edited in devtools, so it is filtered down to slugs that still
// Exist rather than rendering a crumb to nowhere
const getRecordedTrail = (trail: unknown) =>
  Array.isArray(trail)
    ? trail.filter((slug): slug is NavigationTrailPage => NAVIGATION_TRAIL_PAGES.includes(slug))
    : [];
// The trail is state of the history entry: "how I got here" is not an address, so it does not belong in the url
// (two addresses for one resource), and it is not a preference, so it does not belong in storage. The browser
// Already keeps entry state across a reload and restores each entry's own on back and forward — exactly the
// Lifetime a trail wants — so this hook is the only writer. See /docs/platform/breadcrumb-trail
export default defineNuxtPlugin(() => {
  const router = useRouter();
  const navigationTrailStore = useNavigationTrailStore();
  router.afterEach((to, from, failure) => {
    // An aborted or redirected navigation never landed, so the entry the visitor is on is still the old one —
    // Resolving a trail for a page nobody is looking at would record it against that entry
    if (failure) return;
    // An entry that already carries a trail was visited before — a reload, or back/forward onto it — so its own
    // Record wins over anything recomputed from a navigation that is no longer happening
    const recordedTrail = getRecordedTrail(window.history.state?.trail);
    if (recordedTrail.length > 0) {
      navigationTrailStore.setTrail(recordedTrail);
      return;
    }

    const trail = getNextNavigationTrail(from.path, to.path, navigationTrailStore.trail);
    navigationTrailStore.setTrail(trail);
    if (trail.length > 0) window.history.replaceState({ ...window.history.state, trail }, "");
  });
});
