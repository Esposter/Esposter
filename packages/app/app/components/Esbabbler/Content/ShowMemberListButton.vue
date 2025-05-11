<script setup lang="ts">
import { useLayoutStore } from "@/store/layout";

const layoutStore = useLayoutStore();
const { rightDrawerOpen } = storeToRefs(layoutStore);
</script>

<template>
  <v-tooltip location="bottom" text="Show Member List">
    <template #activator="{ props }">
      <v-btn icon="mdi-account-multiple" size="small" :="props" @click="rightDrawerOpen = !rightDrawerOpen" />
    </template>
  </v-tooltip>
</template>
