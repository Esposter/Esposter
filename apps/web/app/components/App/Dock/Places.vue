<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { RECENT_PAGE_EXCLUDED_PATHS, RECENT_PAGES_SHOWN_LIMIT } from "@/services/app/constants";
import { authClient } from "@/services/auth/authClient";
import { useBookmarkStore } from "@/store/bookmark";
import { useRecentPageStore } from "@/store/recentPage";

const { data: session } = await authClient.useSession(useFetch);
const { currentRoute } = useRouter();
const bookmarkStore = useBookmarkStore();
const { bookmarkPaths, bookmarks } = storeToRefs(bookmarkStore);
const { readBookmarks, toggleBookmark } = bookmarkStore;
const recentPageStore = useRecentPageStore();
const { rankedRecentPages } = storeToRefs(recentPageStore);
// A bookmarked page is already in reach above, so the recent list spends its few rows on the others
const recentPages = computed(() =>
  rankedRecentPages.value.filter(({ path }) => !bookmarkPaths.value.has(path)).slice(0, RECENT_PAGES_SHOWN_LIMIT),
);
const isBookmarkable = computed(
  () => Boolean(session.value) && !RECENT_PAGE_EXCLUDED_PATHS.includes(currentRoute.value.path),
);
const isBookmarked = computed(() => bookmarkPaths.value.has(currentRoute.value.path));

if (session.value) await readBookmarks();
</script>

<!-- The reader's own places: the pages they bookmarked, then the ones they come back to most, each one click away.
     Its display is the caller's: a column on the rail, a wrapping row in the launcher -->
<template>
  <div gap-1 items-center>
    <UiIconButton
      v-if="isBookmarkable"
      :aria-pressed="isBookmarked"
      :label="isBookmarked ? 'Remove bookmark' : 'Bookmark this page'"
      :meaning="UiIconMeaning.Bookmark"
      :variant="UiButtonVariant.Quiet"
      @click="
        toggleBookmark(
          currentRoute.path,
          rankedRecentPages.find(({ path }) => path === currentRoute.path)?.title || currentRoute.path,
        )
      "
    />
    <AppDockPageLink v-for="bookmark of bookmarks" :key="bookmark.path" :page="bookmark" />
    <!-- The recent pages live in this browser's storage, which the server render cannot read -->
    <ClientOnly>
      <div v-if="recentPages.length > 0" aria-hidden="true" bg-panel-edge size-1 />
      <AppDockPageLink v-for="recentPage of recentPages" :key="recentPage.path" :page="recentPage" />
    </ClientOnly>
  </div>
</template>
