<script setup lang="ts">
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { RECENT_PAGE_EXCLUDED_PATHS } from "@/services/app/constants";
import { getPageLabel } from "@/services/app/getPageLabel";
import { useBookmarkStore } from "@/store/bookmark";
import { usePageMarkStore } from "@/store/pageMark";
import { useRecentPageStore } from "@/store/recentPage";

const { data: session } = await useAuthSession();
const { currentRoute } = useRouter();
const bookmarkStore = useBookmarkStore();
const { bookmarkPaths } = storeToRefs(bookmarkStore);
const { toggleBookmark } = bookmarkStore;
const pageMarkStore = usePageMarkStore();
const { getPageMark } = pageMarkStore;
const recentPageStore = useRecentPageStore();
const { rankedRecentPages } = storeToRefs(recentPageStore);
const isBookmarkable = computed(
  () => Boolean(session.value) && !RECENT_PAGE_EXCLUDED_PATHS.includes(currentRoute.value.path),
);
const isBookmarked = computed(() => bookmarkPaths.value.has(currentRoute.value.path));
</script>

<!-- Keeping the page open now among the reader's places, said in words: a mark alone on the rail read as anything
     but what it did. The launcher's first row, so it reads as one more thing the panel does rather than a button -->
<template>
  <button
    v-if="isBookmarkable"
    type="button"
    ui-item
    @click="
      () => {
        const pageMark = getPageMark(currentRoute.path);
        const pageLabel = getPageLabel(
          currentRoute.path,
          rankedRecentPages.find(({ path }) => path === currentRoute.path)?.title ?? '',
        );
        toggleBookmark({ mark: pageMark, path: currentRoute.path, title: pageLabel });
      }
    "
  >
    <UiItemContent v-if="isBookmarked" :meaning="UiIconMeaning.Unbookmark" title="Remove bookmark" />
    <UiItemContent v-else :meaning="UiIconMeaning.Bookmark" title="Bookmark this page" />
  </button>
</template>
