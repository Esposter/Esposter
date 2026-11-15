<script setup lang="ts">
import type { PageLink } from "#shared/models/app/PageLink";
import type { Item } from "#src/models/shared/Item";

import UiButton from "#src/components/Ui/Button.vue";
import UiButtonLink from "#src/components/Ui/ButtonLink.vue";
import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { UNAVAILABLE_PAGE_LABEL } from "#src/services/app/constants";
import { getPageIcon } from "#src/services/app/getPageIcon";
import { getPageLabel } from "#src/services/app/getPageLabel";
import { useBookmarkStore } from "#src/store/bookmark";
import { mergeProps } from "vue";

interface Props {
  // A bookmark whose page can no longer be reached: drawn muted, and a press removes the bookmark rather than visiting
  isUnavailable?: true;
  page: PageLink;
}

const { isUnavailable, page } = defineProps<Props>();
const label = computed(() => getPageLabel(page.path, page.title));
const icon = computed(() => getPageIcon(page));
const { data: session } = await useAuthSession();
const bookmarkStore = useBookmarkStore();
const { bookmarkPaths } = storeToRefs(bookmarkStore);
const { toggleBookmark } = bookmarkStore;
const isBookmarked = computed(() => bookmarkPaths.value.has(page.path));
const togglePageBookmark = () => toggleBookmark({ mark: page.mark, path: page.path, title: label.value });
// A place that cannot be reached has no page to visit, so pressing it takes its bookmark away instead
const placeProps = computed(() => (isUnavailable ? { onClick: togglePageBookmark } : { to: page.path }));
const ariaLabel = computed(() => {
  if (isUnavailable) return `${label.value} (${UNAVAILABLE_PAGE_LABEL})`;
  return isBookmarked.value ? `${label.value} (bookmarked)` : label.value;
});
const { getContextMenuProps } = useContextMenu();
// A place on the dock can be opened beside the current page, and kept or let go without visiting it first
const contextMenuProps = getContextMenuProps(page.path, () => {
  const items: Item[] = isUnavailable
    ? []
    : [
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
     from the ones only visited often, wherever the two are drawn. One that cannot be reached is a button drawn muted -->
<template>
  <UiTooltip #default="{ activatorProps }" :label="isUnavailable ? UNAVAILABLE_PAGE_LABEL : label">
    <component
      :is="isUnavailable ? UiButton : UiButtonLink"
      :="mergeProps(activatorProps, contextMenuProps, placeProps)"
      class="page-link"
      :class="isUnavailable && 'op-disabled'"
      :aria-label
      :variant="UiButtonVariant.Quiet"
      px-0
      size-10
      relative
    >
      <UiIcon v-if="icon && 'meaning' in icon" :meaning="icon.meaning" />
      <span v-else-if="icon" :class="icon.icon" aria-hidden="true" size-6 />
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
    </component>
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
