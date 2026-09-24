<script setup lang="ts">
import { POPOVER_POSITION_TRY } from "@/services/ui/constants";
import { usePopover } from "@vuetify/v0";

interface Props {
  // Where the caret is on the screen, which the panel opens over and flips under where there is no room above
  rect?: DOMRect;
}

// A panel over a caret in a document the reader keeps typing in — a composer's mention, emoji or command
// Completions. Focus stays in the document, so the panel is a manual popover nothing light-dismisses, and it is
// Rendered where the document is, so the nearest theme scope and style reach it. The caret has no element of its own
// To anchor to, so a box the caret's size stands at its place
defineSlots<{ default: () => VNode }>();
const { rect } = defineProps<Props>();
const anchor = useTemplateRef("anchor");
const content = useTemplateRef("content");
const isOpen = ref(false);
const { anchorStyles, attach, attachAnchor, contentAttrs, contentStyles } = usePopover({
  isOpen,
  positionArea: "top span-right",
  positionTry: POPOVER_POSITION_TRY,
});

attachAnchor(anchor);
attach(content);

watchImmediate(
  () => rect !== undefined,
  (hasRect) => {
    isOpen.value = hasRect;
  },
);
</script>

<template>
  <span
    ref="anchor"
    aria-hidden="true"
    :style="{
      ...anchorStyles,
      height: `${rect?.height ?? 0}px`,
      left: `${rect?.left ?? 0}px`,
      top: `${rect?.top ?? 0}px`,
      width: `${rect?.width ?? 0}px`,
    }"
    pointer-events-none
    fixed
  />
  <div ref="content" v-bind="contentAttrs" popover="manual" :style="contentStyles" ui-popover>
    <slot />
  </div>
</template>
