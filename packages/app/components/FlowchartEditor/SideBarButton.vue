<script setup lang="ts">
import { useLayoutStore } from "@/store/layout";

const layoutStore = useLayoutStore();
const { leftDrawerOpen, leftDrawerOpenAuto } = storeToRefs(layoutStore);
</script>

<template>
  <div v-if="!leftDrawerOpenAuto" class="vue-flow__panel">
    <v-tooltip text="Components">
      <template #activator="{ props }">
        <v-btn icon="mdi-chevron-double-right" :="props" @click="leftDrawerOpen = true" />
      </template>
    </v-tooltip>
  </div>
</template>
