<script setup lang="ts">
import { useMenu } from "@/composables/ui/useMenu";
import { POPOVER_POSITION_AREA, POPOVER_POSITION_TRY } from "@/services/ui/constants";
import { getUiMenuItems } from "@/services/ui/getUiMenuItems";
import { useContextMenuStore } from "@/store/ui/contextMenu";
import { usePopover } from "@vuetify/v0";

const contextMenuStore = useContextMenuStore();
const { contextMenu } = storeToRefs(contextMenuStore);
const { closeContextMenu } = contextMenuStore;
const anchor = useTemplateRef("anchor");
const content = useTemplateRef("content");
const popover = usePopover({ positionArea: POPOVER_POSITION_AREA, positionTry: POPOVER_POSITION_TRY });
const { anchorStyles, attach, attachAnchor, close, contentAttrs, contentStyles, isOpen, open } = popover;
const items = computed(() => getUiMenuItems(contextMenu.value?.items ?? []));
// Read when the menu is chosen from rather than when it closes: closing clears what is open
let openItems = contextMenu.value?.items ?? [];
let opener: HTMLElement | undefined;
const { choose, first, getItemId, isTabbable, onMenuKeydown } = useMenu(items, popover, {
  onSelect: async (title, event) => {
    await openItems.find((item) => item.title === title)?.onClick?.(event);
  },
  returnFocusTo: () => opener,
});

attachAnchor(anchor);
attach(content);
// The element it opened over is not away from it: the click a long press's lifting finger raises lands there
onClickOutside(content, () => close(), { ignore: [computed(() => contextMenu.value?.opener)] });

// A second right-click while one menu is open moves it rather than closing it, and it lands on its new first item
watch(contextMenu, async (newContextMenu) => {
  if (!newContextMenu) {
    close();
    return;
  }

  openItems = newContextMenu.items;
  ({ opener } = newContextMenu);
  if (!isOpen.value) {
    open();
    return;
  }

  await nextTick();
  first();
});
watch(isOpen, (newIsOpen) => {
  if (!newIsOpen) closeContextMenu();
});
</script>

<!-- The one context menu, opened at a point rather than under a trigger. A manual popover, so it closes by the rules
     here alone: an auto popover's light dismiss lands after a second right-click has already reopened it, and would
     shut the menu that click opened -->
<template>
  <span
    ref="anchor"
    aria-hidden="true"
    :style="{ ...anchorStyles, left: `${contextMenu?.x ?? 0}px`, top: `${contextMenu?.y ?? 0}px` }"
    size-0
    pointer-events-none
    fixed
  />
  <div
    ref="content"
    :="contentAttrs"
    aria-label="Context menu"
    popover="manual"
    role="menu"
    :style="contentStyles"
    tabindex="-1"
    ui-popover
    @keydown="(event) => onMenuKeydown(event)"
  >
    <UiMenuItems :get-item-id :is-tabbable :items @select="(value, event) => choose(value, event)" />
  </div>
</template>
