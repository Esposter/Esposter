<script setup lang="ts">
import { ITEM_NAME } from "@/services/clicker/constants";
import { formatNumberLong } from "@/services/clicker/format";
import { useGameStore } from "@/store/clicker/game";

await useReadClickerGame();
useTimers();
const gameStore = useGameStore();
const { game } = storeToRefs(gameStore);
const displayNoPoints = computed(() => formatNumberLong(game.value.noPoints));
</script>

<template>
  <NuxtLayout>
    <Head>
      <Title>{{ displayNoPoints }} {{ ITEM_NAME }}s</Title>
    </Head>
    <template #left>
      <ClickerModelStoreHeader pt-4 />
      <ClickerModelStoreList />
    </template>
    <v-container h-full flex justify-center items-center flex-col>
      <ClickerHeader w-full />
      <ClickerModelPointsTitle />
      <ClickerContent />
    </v-container>
    <ClickerModelPointsPopups />
    <template #right>
      <ClickerModelInventoryHeader pt-4 />
      <ClickerModelInventoryList />
    </template>
  </NuxtLayout>
</template>

<style lang="scss">
// Disable selecting text for better UX when clicking
.v-main {
  user-select: none;
}
</style>

<style scoped lang="scss">
:deep(.v-list-group__items > .v-list-item) {
  padding-inline-start: 1rem !important;
}
</style>
