<script setup lang="ts">
import { useLayoutStore } from "@/store/layout";

const layoutStore = useLayoutStore();
const { isLeftDrawerOpen, isLeftDrawerOpenAuto, isRightDrawerOpen, isRightDrawerOpenAuto } = storeToRefs(layoutStore);
</script>

<template>
  <v-toolbar bg-transparent>
    <template v-if="!isLeftDrawerOpenAuto" #prepend>
      <StyledTooltipIconButton icon="i-mdi:store" text="Store" @click="isLeftDrawerOpen = true" />
    </template>
    <v-spacer />
    <ClickerModelItemTypeSelectors />
    <v-spacer />
    <template v-if="!isRightDrawerOpenAuto" #append>
      <StyledTooltipIconButton icon="i-mdi:bag-personal" text="Inventory" @click="isRightDrawerOpen = true" />
    </template>
  </v-toolbar>
</template>
