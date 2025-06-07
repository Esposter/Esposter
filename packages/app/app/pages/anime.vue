<script setup lang="ts">
import { DRAWINGS } from "@/services/anime/constants";
import { mod } from "@/util/math/mod";

const carousel = ref(0);
</script>

<template>
  <NuxtLayout>
    <div h-full>
      <v-carousel v-model="carousel" height="100%" :touch="false" :show-arrows="false" hide-delimiters>
        <v-carousel-item v-for="(drawing, index) of DRAWINGS" :key="index">
          <component
            :is="drawing"
            @click-left="carousel = mod(carousel - 1, DRAWINGS.length)"
            @click-right="carousel = mod(carousel + 1, DRAWINGS.length)"
          />
        </v-carousel-item>
      </v-carousel>
    </div>
  </NuxtLayout>
</template>
