<script setup lang="ts">
import { formatNumberLong } from "@/services/clicker/format";
import { useGameStore } from "@/store/clicker/game";

const gameStore = useGameStore();
const { game } = $(storeToRefs(gameStore));
const displayNoPoints = $computed(() => formatNumberLong(game.noPoints));

useTimers();
</script>

<template>
  <NuxtLayout>
    <Head>
      <Title>{{ displayNoPoints }} {{ ITEM_NAME }}s</Title>
    </Head>
    <template #left>
      <ClickerModelStoreHeader pt="4" />
      <ClickerModelStoreList />
    </template>
    <v-container h="full" display="flex" justify="center" items="center" flex="col">
      <!-- Only show the fully loaded game to the client, not the preloaded server state -->
      <ClientOnly>
        <ClickerHeader w="full" />
        <ClickerModelPointsTitle />
        <ClickerContent />
      </ClientOnly>
    </v-container>
    <ClickerModelPointsPopups />
    <template #right>
      <ClickerModelInventoryHeader pt="4" />
      <ClickerModelInventoryList />
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
:deep(.v-list-group__items > .v-list-item) {
  padding-inline-start: 1rem !important;
}
</style>
