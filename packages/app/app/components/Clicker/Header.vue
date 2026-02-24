<script setup lang="ts">
import { useLayoutStore } from "@/store/layout";

const layoutStore = useLayoutStore();
const { isLeftDrawerOpen, isLeftDrawerOpenAuto, isRightDrawerOpen, isRightDrawerOpenAuto } = storeToRefs(layoutStore);
</script>

<template>
  <v-toolbar bg-transparent>
    <template v-if="!isLeftDrawerOpenAuto" #prepend>
      <v-tooltip text="Store">
        <template #activator="{ props }">
          <v-btn icon="mdi-store" :="props" @click="isLeftDrawerOpen = true" />
        </template>
      </v-tooltip>
    </template>
    <v-spacer />
    <ClickerModelItemTypeSelectors />
    <v-spacer />
    <template v-if="!isRightDrawerOpenAuto" #append>
      <v-tooltip text="Inventory">
        <template #activator="{ props }">
          <v-btn icon="mdi-bag-personal" :="props" @click="isRightDrawerOpen = true" />
        </template>
      </v-tooltip>
    </template>
  </v-toolbar>
</template>
