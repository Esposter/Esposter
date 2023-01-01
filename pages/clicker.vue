<script setup lang="ts">
import { formatNumberLong } from "@/services/clicker/format";
import { useGameStore } from "@/store/clicker/useGameStore";
import { ITEM_NAME } from "@/util/constants.client";
import { storeToRefs } from "pinia";

const gameStore = useGameStore();
const { game } = $(storeToRefs(gameStore));
const displayNoPoints = $computed(() => (game ? formatNumberLong(game.noPoints) : 0));
</script>

<template>
  <NuxtLayout v-if="game">
    <Head>
      <Title>{{ displayNoPoints }} {{ ITEM_NAME }}s</Title>
    </Head>
    <template #left>
      <ClickerStoreHeader pt="4" />
      <ClickerStoreList />
    </template>
    <v-container h="full" display="flex" justify="center" items="center" flex="col">
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
