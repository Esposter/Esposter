<script setup lang="ts">
import { DRAWINGS } from "#src/services/anime/constants";
import { mod } from "#src/util/math/mod";
import { takeOne } from "@esposter/shared";

const drawingIndex = ref(0);
</script>

<template>
  <div h-full ui-body>
    <!-- A drawing left keeps its calculator, so coming back to it redraws nothing. The note sits outside the
      transition: a comment in its slot is a node the server renders and the client's development build does not, so
      hydration would meet the comment where it expects the drawing -->
    <TransitionFade mode="out-in">
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
