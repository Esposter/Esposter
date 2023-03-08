<script setup lang="ts">
import { createInitialGame } from "@/services/clicker/createInitialGame";
import { formatNumberLong } from "@/services/clicker/format";
import { CLICKER_STORE, ITEM_NAME } from "@/services/clicker/settings";
import { useGameStore } from "@/store/clicker/game";

const { $client } = useNuxtApp();
const { status } = useSession();
const gameStore = useGameStore();
const { game } = storeToRefs(gameStore);
const displayNoPoints = computed(() => formatNumberLong(game.value?.noPoints ?? 0));

if (status.value === "authenticated") game.value = await $client.clicker.readGame.query();

useTimers();

onMounted(() => {
  if (status.value === "unauthenticated") {
    const clickerStore = localStorage.getItem(CLICKER_STORE);
    game.value = clickerStore ? JSON.parse(clickerStore) : createInitialGame();
  }
});

onUnmounted(() => {
  game.value = null;
});
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
    <v-container v-if="game" h="full" display="flex" justify="center" items="center" flex="col">
      <ClickerHeader w="full" />
      <ClickerModelPointsTitle />
      <ClickerContent />
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
