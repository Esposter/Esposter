<script setup lang="ts">
const drawings = [
  defineAsyncComponent(() => import("@/components/Anime/Frieren.vue")),
  defineAsyncComponent(() => import("@/components/Anime/Yui.vue")),
  defineAsyncComponent(() => import("@/components/Anime/Azunyan.vue")),
];
</script>

<template>
  <NuxtLayout>
    <v-container fluid p-0="!" h-full>
      <v-carousel height="100%" :touch="false" show-arrows="hover" hide-delimiters>
        <v-carousel-item v-for="(drawing, index) in drawings" :key="index">
          <component :is="drawing" />
        </v-carousel-item>
      </v-carousel>
    </v-container>
  </NuxtLayout>
</template>
