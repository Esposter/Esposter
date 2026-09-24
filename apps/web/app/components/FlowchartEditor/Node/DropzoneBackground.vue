<script setup lang="ts">
import { useDragStore } from "@/store/flowchartEditor/drag";

const dragStore = useDragStore();
const { isDragOver } = storeToRefs(dragStore);
</script>

<template>
  <!-- Fades in over the canvas while something is dragged over it, and says where it will land -->
  <div v-if="isDragOver" class="dropzone" flex pointer-events-none items-center inset-0 justify-center absolute>
    <p ui-heading>Drop here</p>
  </div>
</template>

<style scoped>
.dropzone {
  background-color: color-mix(in srgb, var(--ui-background) 70%, transparent);
  transition: opacity var(--ui-motion-short);
}

@starting-style {
  .dropzone {
    opacity: 0;
  }
}
</style>
