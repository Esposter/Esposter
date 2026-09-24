<script setup lang="ts">
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

const emit = defineEmits<{ clickLeft: [event: MouseEvent]; clickRight: [event: MouseEvent] }>();
</script>

<template>
  <div
    bottom="[--dock-inset-block-end]"
    h="[calc(100dvh_-_--dock-inset-block-end)]"
    px-4
    flex
    fixed
    left-0
    top-auto
    w-full
    items-center
    justify-between
    pointer-events-none
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
