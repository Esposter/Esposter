<script setup lang="ts">
import { useLayoutStore } from "@/store/layout";

const layoutStore = useLayoutStore();
const { isLeftDrawerOpen, isLeftDrawerOpenAuto } = storeToRefs(layoutStore);
</script>

<template>
  <v-tooltip v-if="!isLeftDrawerOpenAuto" location="bottom" text="Show Room List">
    <template #activator="{ props }">
      <v-btn icon="mdi-menu" size="small" :="props" @click="isLeftDrawerOpen = true" />
    </template>
  </v-tooltip>
</template>
