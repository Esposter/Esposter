<script setup lang="ts">
import type { PageLink } from "@/models/app/PageLink";
import type { Item } from "@/models/shared/Item";

import { getPageLabel } from "@/services/app/getPageLabel";
import { getPageLinkItem } from "@/services/app/getPageLinkItem";
import { authClient } from "@/services/auth/authClient";
import { useBookmarkStore } from "@/store/bookmark";
import { mergeProps } from "vue";

interface Props {
  page: PageLink;
}

const { page } = defineProps<Props>();
const label = computed(() => getPageLabel(page.path, page.title));
const icon = computed(() => getPageLinkItem(page.path)?.icon);
const { data: session } = await authClient.useSession(useFetch);
const bookmarkStore = useBookmarkStore();
const { bookmarkPaths } = storeToRefs(bookmarkStore);
const { toggleBookmark } = bookmarkStore;
const { getContextMenuProps } = useContextMenu();
// A place on the dock can be opened beside the current page, and kept or let go without visiting it first
const contextMenuProps = getContextMenuProps(page.path, () => {
  const items: Item[] = [
    {
      icon: "i-mdi:open-in-new",
      onClick: () => {
        window.open(page.path, "_blank");
      },
      title: "Open in new tab",
    },
  ];
  if (!session.value) return items;

  const isBookmarked = bookmarkPaths.value.has(page.path);
  return [
    ...items,
    {
      icon: isBookmarked ? "i-mdi:bookmark-remove" : "i-mdi:bookmark-plus",
      onClick: () => toggleBookmark(page.path, label.value),
      title: isBookmarked ? "Remove bookmark" : "Bookmark",
    },
  ];
});
</script>

<template>
  <UiTooltip #default="{ activatorProps }" :label>
    <NuxtInvisibleLink
      :="mergeProps(activatorProps, contextMenuProps)"
      class="page-link hover:bg-accent/20"
      :to="page.path"
      :aria-label="label"
      flex
      shrink-0
      size-10
      items-center
      justify-center
    >
      <v-icon v-if="icon" :icon size="1.5rem" />
      <UiAvatar v-else :name="label" />
    </NuxtInvisibleLink>
  </UiTooltip>
</template>

<style scoped>
.page-link[aria-current="page"] {
  background-color: color-mix(in srgb, var(--ui-accent) 20%, transparent);
  color: var(--ui-accent);
}
</style>
