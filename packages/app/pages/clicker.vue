<script setup lang="ts">
import { formatNumberLong } from "@/services/clicker/format";
import { useClickerStore } from "@/store/clicker";

await useReadClickerGame();
useTimers();
const clickerStore = useClickerStore();
const { game } = storeToRefs(clickerStore);
const clickerItemProperties = useClickerItemProperties();
const displayNoPoints = computed(() => formatNumberLong(game.value.noPoints, 3));
</script>

<template>
  <NuxtLayout>
    <Head>
      <Title>{{ displayNoPoints }} {{ clickerItemProperties.pluralName }}</Title>
    </Head>
    <template #left>
      <ClickerModelStoreHeader pt-4 />
      <ClickerModelStoreList />
    </template>
    <v-container flex justify-center h-full flex-col items-center>
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

<style scoped lang="scss">
:deep(.v-list-group__items > .v-list-item) {
  padding-inline-start: 1rem !important;
}
</style>
