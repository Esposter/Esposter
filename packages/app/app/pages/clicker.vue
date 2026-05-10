<script setup lang="ts">
import { formatNumberLong } from "@/services/clicker/format";
import { useClickerStore } from "@/store/clicker";

await useReadClicker();
useTimers();
const clickerStore = useClickerStore();
const { clicker, clickerItemProperties } = storeToRefs(clickerStore);
const displayNoPoints = computed(() => formatNumberLong(clicker.value.noPoints, 3));
</script>

<template>
  <NuxtLayout>
    <Head>
      <Title>{{ displayNoPoints }} {{ clickerItemProperties.pluralName }}</Title>
    </Head>
    <v-container h-full flex flex-col items-center justify-center>
      <ClickerHeader w-full />
      <ClickerModelPointsTitle />
      <ClickerContent />
    </v-container>
    <ClickerModelPointsPopups />
    <template #left>
      <ClickerModelStoreHeader pt-4 />
      <ClickerModelStoreList />
    </template>
    <template #right>
      <ClickerModelInventoryHeader pt-4 />
      <ClickerModelInventoryList />
    </template>
  </NuxtLayout>
</template>

<style scoped>
:deep(.v-list-group__items > .v-list-item) {
  padding-inline-start: 1rem;
}
</style>
