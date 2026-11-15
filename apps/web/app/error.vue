<script setup lang="ts">
import type { NuxtError } from "#app";

import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { useBookmarkStore } from "#src/store/bookmark";
import { RoutePath } from "@esposter/shared";

interface Props {
  // Only what the page reads: on the server it receives Nuxt's serialized error, a plain object without the class's
  // Deprecated `statusCode` / `statusMessage` getters, so typing it as the class lets those reads typecheck and fail
  error: Pick<NuxtError, "status" | "statusText">;
}

const { error } = defineProps<Props>();
const { currentRoute } = useRouter();
const { data: session } = await useAuthSession();
const bookmarkStore = useBookmarkStore();
const { bookmarks } = storeToRefs(bookmarkStore);
const { readBookmarks, toggleBookmark } = bookmarkStore;
// A bookmark of this address outlives a page that no longer exists, so the bookmark is offered for removal from here
const bookmark = computed(() => bookmarks.value.find(({ path }) => path === currentRoute.value.path));
if (session.value) await readBookmarks();
const togglePageBookmark = () => {
  if (bookmark.value) return toggleBookmark({ path: bookmark.value.path, title: bookmark.value.title });
};
const isNotFound = computed(() => error.status === 404);
const title = computed(() => (isNotFound.value ? "Page not found" : "Something went wrong"));
// Nuxt replaces a server error's own message with a generic one in production, so this is safe to render as-is
const description = computed(() =>
  isNotFound.value
    ? "Nothing lives at this address. It may have moved, or it was never here."
    : error.statusText || "The page could not be loaded. Trying again often works.",
);
</script>

<template>
  <!-- Nuxt renders this in place of App.vue, for a route nothing matches as much as for a failure, so the dock is not
    Here and the way home is the page's own -->
  <NuxtTheme>
    <main text-text bg-background flex items-center justify-center min-h-dvh>
      <AppStatusScene :description :is-missing-block="isNotFound || undefined" :status-code="error.status" :title>
        <UiButton
          v-if="!isNotFound"
          :variant="UiButtonVariant.Accent"
          px-4
          @click="clearError({ redirect: currentRoute.fullPath })"
        >
          Try again
        </UiButton>
        <UiButton v-if="isNotFound && bookmark" px-4 @click="togglePageBookmark()">Remove bookmark</UiButton>
        <UiButton
          :variant="isNotFound ? UiButtonVariant.Accent : undefined"
          px-4
          @click="clearError({ redirect: RoutePath.Index })"
        >
          Go home
        </UiButton>
      </AppStatusScene>
    </main>
  </NuxtTheme>
</template>
