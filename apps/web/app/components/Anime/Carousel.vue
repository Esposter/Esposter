<script setup lang="ts">
import { DRAWINGS } from "#src/services/anime/constants";
import { mod } from "#src/util/math/mod";
import { takeOne } from "@esposter/shared";

const drawingIndex = ref(0);
</script>

<template>
  <div h-full ui-body>
    <TransitionFade mode="out-in">
      <!-- A drawing left keeps its calculator, so coming back to it redraws nothing -->
      <KeepAlive>
        <component
          :is="takeOne(DRAWINGS, drawingIndex)"
          @click-left="drawingIndex = mod(drawingIndex - 1, DRAWINGS.length)"
          @click-right="drawingIndex = mod(drawingIndex + 1, DRAWINGS.length)"
        />
      </KeepAlive>
    </TransitionFade>
  </div>
</template>
