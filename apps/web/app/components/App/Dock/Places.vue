<script setup lang="ts">
import { RECENT_PAGES_SHOWN_LIMIT } from "@/services/app/constants";
import { authClient } from "@/services/auth/authClient";
import { useBookmarkStore } from "@/store/bookmark";

const { data: session } = await authClient.useSession(useFetch);
const bookmarkStore = useBookmarkStore();
const { bookmarks } = storeToRefs(bookmarkStore);
const { readBookmarks } = bookmarkStore;
const unbookmarkedRecentPages = useUnbookmarkedRecentPages();
const recentPages = computed(() => unbookmarkedRecentPages.value.slice(0, RECENT_PAGES_SHOWN_LIMIT));

if (session.value) await readBookmarks();
</script>

<!-- The reader's own places: the pages they bookmarked, then the ones they come back to most, each one click away, a
     line between the two. Its display is the caller's: a column on the rail, a wrapping row in the launcher, which only
     a narrow screen shows, so the line lies across the column and stands up in the row -->
<template>
  <div gap-1 items-center>
    <AppDockPageLink v-for="bookmark of bookmarks" :key="bookmark.path" :page="bookmark" />
    <!-- The recent pages live in this browser's storage, which the server render cannot read -->
    <ClientOnly>
      <div
        v-if="bookmarks.length > 0 && recentPages.length > 0"
        aria-hidden="true"
        bg-divider
        shrink-0
        w="[var(--ui-border-width)] md:6"
        h="6 md:[var(--ui-border-width)]"
      />
      <AppDockPageLink v-for="recentPage of recentPages" :key="recentPage.path" :page="recentPage" />
    </ClientOnly>
  </div>
</template>
