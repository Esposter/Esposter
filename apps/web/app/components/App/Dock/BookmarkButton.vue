<script setup lang="ts">
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { RECENT_PAGE_EXCLUDED_PATHS } from "@/services/app/constants";
import { authClient } from "@/services/auth/authClient";
import { useBookmarkStore } from "@/store/bookmark";
import { useRecentPageStore } from "@/store/recentPage";

const { data: session } = await authClient.useSession(useFetch);
const { currentRoute } = useRouter();
const bookmarkStore = useBookmarkStore();
const { bookmarkPaths } = storeToRefs(bookmarkStore);
const { toggleBookmark } = bookmarkStore;
const recentPageStore = useRecentPageStore();
const { rankedRecentPages } = storeToRefs(recentPageStore);
const isBookmarkable = computed(
  () => Boolean(session.value) && !RECENT_PAGE_EXCLUDED_PATHS.includes(currentRoute.value.path),
);
const isBookmarked = computed(() => bookmarkPaths.value.has(currentRoute.value.path));
</script>

<!-- Keeping the page open now among the reader's places, said in words: a mark alone on the rail read as anything
     but what it did -->
<template>
  <UiButton
    v-if="isBookmarkable"
    py-1
    flex
    gap-2
    items-center
    @click="
      toggleBookmark(
        currentRoute.path,
        rankedRecentPages.find(({ path }) => path === currentRoute.path)?.title || currentRoute.path,
      )
    "
  >
    <UiIcon :meaning="UiIconMeaning.Bookmark" />
    {{ isBookmarked ? "Remove bookmark" : "Bookmark this page" }}
  </UiButton>
</template>
