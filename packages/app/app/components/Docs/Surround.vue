<script setup lang="ts">
import type { ContentNavigationItem } from "@nuxt/content";

interface SurroundProps {
  surround: [ContentNavigationItem | null, ContentNavigationItem | null];
}

const { surround } = defineProps<SurroundProps>();
const previous = computed(() => surround[0]);
const next = computed(() => surround[1]);
</script>

<template>
  <div v-if="previous || next" mt-12 gap-4 grid grid-cols-1 md:grid-cols-2>
    <v-card v-if="previous" link variant="outlined" hover @click="navigateTo(previous.path)">
      <v-card-item>
        <p mb-1 flex gap-x-1 items-center op-medium-emphasis text-body-small>
          <v-icon icon="mdi-arrow-left" size="small" />
          Previous
        </p>
        <v-card-title>{{ previous.title }}</v-card-title>
        <v-card-subtitle>{{ previous.description }}</v-card-subtitle>
      </v-card-item>
    </v-card>
    <div v-else />
    <v-card v-if="next" link variant="outlined" hover text-right @click="navigateTo(next.path)">
      <v-card-item>
        <p mb-1 flex gap-x-1 items-center justify-end op-medium-emphasis text-body-small>
          Next
          <v-icon icon="mdi-arrow-right" size="small" />
        </p>
        <v-card-title>{{ next.title }}</v-card-title>
        <v-card-subtitle>{{ next.description }}</v-card-subtitle>
      </v-card-item>
    </v-card>
  </div>
</template>
