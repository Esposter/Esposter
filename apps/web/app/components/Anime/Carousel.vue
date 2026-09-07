<script setup lang="ts">
import { Drawings } from "@/services/anime/constants";
import { mod } from "@/util/math/mod";

const drawingIndex = ref(0);
</script>

<template>
  <div h-full>
    <v-carousel v-model="drawingIndex" height="100%" :touch="false" :show-arrows="false" hide-delimiters>
      <v-carousel-item v-for="(drawing, index) of Drawings" :key="index">
        <component
          :is="drawing"
          @click-left="drawingIndex = mod(drawingIndex - 1, Drawings.length)"
          @click-right="drawingIndex = mod(drawingIndex + 1, Drawings.length)"
        />
      </v-carousel-item>
    </v-carousel>
  </div>
</template>
