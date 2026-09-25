import type { PageMark } from "#shared/models/app/PageMark";

import { usePageMarkStore } from "@/store/pageMark";

// Declares what the calling page is for as long as it is mounted, at whatever path it is at now — a resource page
// Keeps its mark across its blades' paths — so the dock can draw the page's mark rather than its title's letter
export const usePageMark = (pageMark: MaybeRefOrGetter<PageMark | undefined>) => {
  // oxlint-disable-next-line no-restricted-globals -- the frozen page route is the point: a page being swapped out keeps its own path, so its mark never lands on the next page's, and the registration leaves with the page
  const route = useRoute();
  const pageMarkStore = usePageMarkStore();
  const { registerPageMark } = pageMarkStore;
  onScopeDispose(registerPageMark(() => ({ mark: toValue(pageMark), path: route.path })));
};
