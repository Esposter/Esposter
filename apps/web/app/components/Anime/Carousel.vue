<script setup lang="ts">
import { DRAWINGS } from "@/services/anime/constants";
import { mod } from "@/util/math/mod";
import { takeOne } from "@esposter/shared";

const drawingIndex = ref(0);
</script>

<template>
  <div h-full ui-body>
    <Transition name="drawing" mode="out-in">
      <!-- A drawing left keeps its calculator, so coming back to it redraws nothing -->
      <KeepAlive>
        <component
          :is="takeOne(DRAWINGS, drawingIndex)"
          @click-left="drawingIndex = mod(drawingIndex - 1, DRAWINGS.length)"
          @click-right="drawingIndex = mod(drawingIndex + 1, DRAWINGS.length)"
        />
      </KeepAlive>
    </Transition>
  </div>
</template>

<style scoped>
.drawing-enter-active,
.drawing-leave-active {
  transition: opacity var(--ui-motion-medium);
}

.drawing-enter-from,
.drawing-leave-to {
  opacity: 0;
}
</style>
