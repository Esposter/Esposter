<script setup lang="ts">
import type { PageLink } from "#shared/models/app/PageLink";
import type { Item } from "@/models/shared/Item";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { getPageIcon } from "@/services/app/getPageIcon";
import { getPageLabel } from "@/services/app/getPageLabel";
import { authClient } from "@/services/auth/authClient";
import { useBookmarkStore } from "@/store/bookmark";
import { mergeProps } from "vue";

interface Props {
  page: PageLink;
}

const { page } = defineProps<Props>();
const label = computed(() => getPageLabel(page.path, page.title));
const icon = computed(() => getPageIcon(page));
const { data: session } = await authClient.useSession(useFetch);
const bookmarkStore = useBookmarkStore();
const { bookmarkPaths } = storeToRefs(bookmarkStore);
const { toggleBookmark } = bookmarkStore;
const isBookmarked = computed(() => bookmarkPaths.value.has(page.path));
const togglePageBookmark = () => toggleBookmark({ mark: page.mark, path: page.path, title: label.value });
const { getContextMenuProps } = useContextMenu();
// A place on the dock can be opened beside the current page, and kept or let go without visiting it first
const contextMenuProps = getContextMenuProps(page.path, () => {
  const items: Item[] = [
    {
      meaning: UiIconMeaning.External,
      onClick: () => {
        window.open(page.path, "_blank");
      },
      title: "Open in new tab",
    },
  ];
  if (!session.value) return items;

  return [
    ...items,
    isBookmarked.value
      ? { meaning: UiIconMeaning.Unbookmark, onClick: togglePageBookmark, title: "Remove bookmark" }
      : { meaning: UiIconMeaning.Bookmark, onClick: togglePageBookmark, title: "Bookmark" },
  ];
});
</script>

<!-- A kept place wears its bookmark at half size in its corner, in the accent, so the reader's own places read apart
     from the ones only visited often, wherever the two are drawn -->
<template>
  <UiTooltip #default="{ activatorProps }" :label>
    <UiButtonLink
      :="mergeProps(activatorProps, contextMenuProps)"
      class="page-link"
      :to="page.path"
      :aria-label="isBookmarked ? `${label} (bookmarked)` : label"
      :variant="UiButtonVariant.Quiet"
      px-0
      size-10
      relative
    >
      <span v-if="icon" :class="icon" aria-hidden="true" size-6 />
      <UiAvatar v-else :name="label" />
      <UiIcon
        v-if="isBookmarked"
        :meaning="UiIconMeaning.Bookmark"
        text-accent
        origin-top-right
        scale-50
        right-0
        top-0
        absolute
      />
    </UiButtonLink>
  </UiTooltip>
</template>

<style scoped>
/* The page open now wears the selected tint a current row does, with its mark in the accent, as the rail's other quiet
   buttons tint only while hovered */
.page-link[aria-current="page"] {
  background-color: color-mix(in srgb, var(--ui-tint) 20%, transparent);
  color: var(--ui-accent);
}
</style>
