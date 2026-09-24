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

<!-- The reader's own places: the pages they bookmarked, then the ones they come back to most, each one click away.
     Its display is the caller's: a column on the rail, a wrapping row in the launcher -->
<template>
  <div gap-1 items-center>
    <AppDockPageLink v-for="bookmark of bookmarks" :key="bookmark.path" :page="bookmark" />
    <!-- The recent pages live in this browser's storage, which the server render cannot read -->
    <ClientOnly>
      <div v-if="bookmarks.length > 0 && recentPages.length > 0" aria-hidden="true" bg-border size-1 />
      <AppDockPageLink v-for="recentPage of recentPages" :key="recentPage.path" :page="recentPage" />
    </ClientOnly>
  </div>
</template>
