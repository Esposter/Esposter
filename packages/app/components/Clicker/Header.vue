<script setup lang="ts">
import { useLayoutStore } from "@/store/layout";

const layoutStore = useLayoutStore();
const { leftDrawerOpen, leftDrawerOpenAuto, rightDrawerOpen, rightDrawerOpenAuto } = storeToRefs(layoutStore);
</script>

<template>
  <v-toolbar>
    <template v-if="!leftDrawerOpenAuto" #prepend>
      <v-tooltip text="Store">
        <template #activator="{ props }">
          <v-btn icon="mdi-store" :="props" @click="leftDrawerOpen = true" />
        </template>
      </v-tooltip>
    </template>
    <v-spacer />
    <ClickerModelItemTypeSelectors />
    <v-spacer />
    <template v-if="!rightDrawerOpenAuto" #append>
      <v-tooltip text="Inventory">
        <template #activator="{ props }">
          <v-btn icon="mdi-bag-personal" :="props" @click="rightDrawerOpen = true" />
        </template>
      </v-tooltip>
    </template>
  </v-toolbar>
</template>
