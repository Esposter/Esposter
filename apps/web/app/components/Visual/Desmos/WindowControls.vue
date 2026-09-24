<script setup lang="ts">
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

const emit = defineEmits<{ clickLeft: [event: MouseEvent]; clickRight: [event: MouseEvent] }>();
</script>

<!-- Either side of the drawing, halfway down the region the dock leaves it. Over a picture, so they keep the raised
     default rather than going quiet -->
<template>
  <div
    bottom="[var(--dock-inset-block-end)]"
    left="[var(--dock-inset-inline-start)]"
    px-4
    flex
    pointer-events-none
    items-center
    right-0
    top-0
    justify-between
    fixed
  >
    <UiIconButton
      label="Previous"
      :meaning="UiIconMeaning.Previous"
      pointer-events-auto
      @click="emit('clickLeft', $event)"
    />
    <UiIconButton label="Next" :meaning="UiIconMeaning.Next" pointer-events-auto @click="emit('clickRight', $event)" />
  </div>
</template>
