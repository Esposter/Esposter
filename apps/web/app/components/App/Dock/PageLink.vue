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

  const onClick = () => toggleBookmark({ mark: page.mark, path: page.path, title: label.value });
  return [
    ...items,
    bookmarkPaths.value.has(page.path)
      ? { meaning: UiIconMeaning.Unbookmark, onClick, title: "Remove bookmark" }
      : { meaning: UiIconMeaning.Bookmark, onClick, title: "Bookmark" },
  ];
});
</script>

<template>
  <UiTooltip #default="{ activatorProps }" :label>
    <UiButtonLink
      :="mergeProps(activatorProps, contextMenuProps)"
      class="page-link"
      :to="page.path"
      :aria-label="label"
      :variant="UiButtonVariant.Quiet"
      px-0
      size-10
    >
      <span v-if="icon" :class="icon" aria-hidden="true" size-6 />
      <UiAvatar v-else :name="label" />
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
