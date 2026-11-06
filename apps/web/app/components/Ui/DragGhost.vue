<script setup lang="ts">
import type { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface Props {
  icon?: UiIconMeaning;
  // Where the pointer is in the viewport, which the chip follows just below and to the right of
  point: { x: number; y: number };
  title: string;
}

const { icon, point, title } = defineProps<Props>();
</script>

<!-- Teleported to the body, so a clipped or transformed panel the drag crosses cannot cut the chip off -->
<template>
  <Teleport to="body">
    <div
      :style="{ left: `calc(${point.x}px + 0.75rem)`, top: `calc(${point.y}px + 0.75rem)` }"
      aria-hidden="true"
      class="drag-ghost"
      flex
      gap-1
      items-center
      fixed
      op-90
      px-2
      py-1
      text-sm
      pointer-events-none
      z-2000
      ui-lifted
    >
      <UiIcon v-if="icon" :meaning="icon" />
      {{ title }}
    </div>
  </Teleport>
</template>

<style scoped>
/* Fades in over the short motion, which reduced motion has already set to no time, so it appears at once for those who asked */
.drag-ghost {
  transition: opacity var(--ui-motion-short);
}

@starting-style {
  .drag-ghost {
    opacity: 0;
  }
}
</style>
