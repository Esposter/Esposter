<script setup lang="ts">
import { useLayoutStore } from "@/store/layout";

const layoutStore = useLayoutStore();
const { isLeftDrawerOpen, isLeftDrawerOpenAuto } = storeToRefs(layoutStore);
</script>

<template>
  <div v-if="!isLeftDrawerOpenAuto" class="vue-flow__panel">
    <v-tooltip text="Components">
      <template #activator="{ props }">
        <v-btn icon="mdi-chevron-double-right" :="props" @click="isLeftDrawerOpen = true" />
      </template>
    </v-tooltip>
  </div>
</template>
