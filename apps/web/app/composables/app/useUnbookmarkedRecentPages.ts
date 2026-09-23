import { useBookmarkStore } from "@/store/bookmark";
import { useRecentPageStore } from "@/store/recentPage";

// The recent pages that are not bookmarked, best ranked first. A bookmarked page is already in reach among the
// Bookmarks, so wherever the two are listed together the recent ones spend their rows on the others
export const useUnbookmarkedRecentPages = () => {
  const bookmarkStore = useBookmarkStore();
  const { bookmarkPaths } = storeToRefs(bookmarkStore);
  const recentPageStore = useRecentPageStore();
  const { rankedRecentPages } = storeToRefs(recentPageStore);
  return computed(() => rankedRecentPages.value.filter(({ path }) => !bookmarkPaths.value.has(path)));
};
