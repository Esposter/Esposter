import { RECENT_PAGE_EXCLUDED_PATHS } from "@/services/app/constants";
import { getPageTitle } from "@/services/app/getPageTitle";
import { usePageMarkStore } from "@/store/pageMark";
import { useRecentPageStore } from "@/store/recentPage";

// Records each page the reader lands on for the dock's recent pages, and the title its head settles on beside the
// Mark the page declares
export default defineNuxtPlugin(() => {
  const router = useRouter();
  const head = injectHead();
  const pageMarkStore = usePageMarkStore();
  const { getPageMark } = pageMarkStore;
  const recentPageStore = useRecentPageStore();
  const { updateRecentPage, visitPage } = recentPageStore;
  router.afterEach((to, _from, failure) => {
    // An aborted or redirected navigation never landed, and an address no page matches is the status page's, so
    // Neither is a visit
    if (failure || to.matched.length === 0 || RECENT_PAGE_EXCLUDED_PATHS.includes(to.path)) return;
    visitPage(to.path);
  });
  head.hooks?.hook("dom:rendered", () => {
    const { path } = router.currentRoute.value;
    const mark = getPageMark(path);
    const title = getPageTitle(window.document.title);
    updateRecentPage({ mark, path, title });
  });
});
