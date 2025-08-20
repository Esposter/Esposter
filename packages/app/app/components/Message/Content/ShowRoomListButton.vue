<script setup lang="ts">
import { useLayoutStore } from "@/store/layout";

const layoutStore = useLayoutStore();
const { leftDrawerOpen, leftDrawerOpenAuto } = storeToRefs(layoutStore);
</script>

<template>
  <v-tooltip v-if="!leftDrawerOpenAuto" location="bottom" text="Show Room List">
    <template #activator="{ props }">
      <v-btn icon="mdi-menu" size="small" :="props" @click="leftDrawerOpen = true" />
    </template>
  </v-tooltip>
</template>
