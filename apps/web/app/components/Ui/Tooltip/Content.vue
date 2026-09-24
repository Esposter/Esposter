<script setup lang="ts">
import { TOOLTIP_NAMESPACE } from "@/services/ui/constants";
import { useTooltipRoot } from "@vuetify/v0";

defineSlots<{ default: () => VNode }>();
const { attach, contentAttrs, contentStyles } = useTooltipRoot(TOOLTIP_NAMESPACE);
const content = useTemplateRef("content");

attach(content);
</script>

<!-- The primitive's own content opens as an auto popover, and opening one closes every other auto popover open
     outside it: hovering a dock button would shut the panel another had open. A manual popover opens beside them -->
<template>
  <div
    ref="content"
    v-bind="contentAttrs"
    class="tooltip"
    popover="manual"
    role="tooltip"
    :style="contentStyles"
    pointer-events-none
    ui-popover
  >
    <div text-sm px-2 py-1 text-nowrap ui-lifted>
      <slot />
    </div>
  </div>
</template>

<style scoped>
/* It pops out of what it names the moment the pointer arrives, and back into it on the way out */
.tooltip {
  opacity: 0;
  transform: scale(0.5);
  transition:
    opacity var(--ui-motion-short),
    transform var(--ui-motion-short),
    display var(--ui-motion-short) allow-discrete,
    overlay var(--ui-motion-short) allow-discrete;
}

.tooltip:popover-open {
  opacity: 1;
  transform: none;
}

@starting-style {
  .tooltip:popover-open {
    opacity: 0;
    transform: scale(0.5);
  }
}
</style>
