<script setup lang="ts">
import { useGameStore } from "@/store/clicker/useGameStore";
import { storeToRefs } from "pinia";

const gameStore = useGameStore();
const { game } = $(storeToRefs(gameStore));
</script>

<template>
  <NuxtLayout>
    <template #left>
      <ClickerStoreHeader pt="4" />
      <ClickerStoreList />
    </template>
    <v-container v-if="game" h="full" display="flex" justify="center" items="center" flex="col">
      <ClickerHeader w="full" />
      <ClickerPointsTitle />
      <ClickerContent />
    </v-container>
    <ClickerClickPopups />
    <template #right>
      <ClickerInventoryHeader pt="4" />
      <ClickerInventoryUpgrades />
    </template>
  </NuxtLayout>
</template>

<style lang="scss">
// Disable selecting text for better UX for clicking
.v-main {
  user-select: none;
}
</style>

<style scoped lang="scss">
:deep(.clickable) {
  &:active {
    transform: $clickShrink;
    transform-origin: center;
  }
}
</style>
