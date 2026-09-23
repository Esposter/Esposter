import { RECENT_PAGE_EXCLUDED_PATHS } from "@/services/app/constants";
import { getPageTitle } from "@/services/app/getPageTitle";
import { useRecentPageStore } from "@/store/recentPage";

// Records each page the reader lands on for the dock's recent pages, and the title its head settles on
export default defineNuxtPlugin(() => {
  const router = useRouter();
  const head = injectHead();
  const recentPageStore = useRecentPageStore();
  const { setPageTitle, visitPage } = recentPageStore;
  router.afterEach((to, _from, failure) => {
    // An aborted or redirected navigation never landed, so it is not a visit
    if (failure || RECENT_PAGE_EXCLUDED_PATHS.includes(to.path)) return;
    visitPage(to.path);
  });
  head.hooks?.hook("dom:rendered", () => {
    setPageTitle(router.currentRoute.value.path, getPageTitle(window.document.title));
  });
});
