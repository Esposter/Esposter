<script setup lang="ts">
import type { Placement } from "@floating-ui/dom";

import { autoUpdate, computePosition, flip, offset, shift, size } from "@floating-ui/dom";

interface Props {
  placement: Placement;
  reference?: HTMLElement;
}

defineSlots<{ default: () => VNode }>();
const { placement, reference } = defineProps<Props>();
const popover = useTemplateRef("popover");
// The browser's top layer holds it, so nothing on the page paints over it and no overflow clips it; it stays where it
// Is in the document, so it keeps the page's palette and font. It is kept inside the window, flipped to the other side
// Of what it hangs off when this one has no room, at least as wide as that and never taller than the room left
let cleanup = () => {};

onMounted(() => {
  const popoverElement = popover.value;
  if (!popoverElement || !reference) return;
  popoverElement.showPopover();
  cleanup = autoUpdate(reference, popoverElement, async () => {
    const { x, y } = await computePosition(reference, popoverElement, {
      middleware: [
        offset(8),
        flip(),
        shift({ padding: 8 }),
        size({
          apply: ({ availableHeight, rects }) => {
            popoverElement.style.maxHeight = `${availableHeight}px`;
            popoverElement.style.minWidth = `${rects.reference.width}px`;
          },
          padding: 8,
        }),
      ],
      placement,
      strategy: "fixed",
    });
    popoverElement.style.left = `${x}px`;
    popoverElement.style.top = `${y}px`;
  });
});

onUnmounted(() => {
  cleanup();
});
</script>

<template>
  <div ref="popover" class="popover" popover="manual" flex flex-col>
    <slot />
  </div>
</template>

<style scoped>
.popover {
  position: fixed;
  inset: auto;
  margin: 0;
  padding: 0;
  border: none;
  overflow: visible;
  background-color: transparent;
  color: inherit;
}
</style>
