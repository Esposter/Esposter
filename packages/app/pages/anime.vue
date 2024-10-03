<script setup lang="ts">
import { mod } from "@/util/math/mod";

const drawings = [
  defineAsyncComponent(() => import("@/components/Anime/Frieren.vue")),
  defineAsyncComponent(() => import("@/components/Anime/Yui.vue")),
  defineAsyncComponent(() => import("@/components/Anime/Azunyan.vue")),
];
const carousel = ref(0);
</script>

<template>
  <NuxtLayout>
    <v-container p-0="!" h-full fluid>
      <v-carousel v-model="carousel" height="100%" :touch="false" :show-arrows="false" hide-delimiters>
        <v-carousel-item v-for="(drawing, index) of drawings" :key="index">
          <component
            :is="drawing"
            @click-left="carousel = mod(carousel - 1, drawings.length)"
            @click-right="carousel = mod(carousel + 1, drawings.length)"
          />
        </v-carousel-item>
      </v-carousel>
    </v-container>
  </NuxtLayout>
</template>
