<script setup lang="ts">
import { formatNumberLong } from "@/services/clicker/formatNumberLong";
import { useClickerStore } from "@/store/clicker";

await useReadClicker();
useTimers();
const clickerStore = useClickerStore();
const { clicker, clickerItemProperties } = storeToRefs(clickerStore);
const displayPointCount = computed(() => formatNumberLong(clicker.value.pointCount, 3));
</script>

<template>
  <NuxtLayout>
    <Head>
      <Title>{{ displayPointCount }} {{ clickerItemProperties.pluralName }}</Title>
    </Head>
    <v-container flex flex-col h-full items-center justify-center>
      <ClickerHeader w-full />
      <ClickerModelPointsTitle />
      <ClickerContent />
    </v-container>
    <ClickerModelPointsPopups />
    <ClickerOfflineProgressDialog />
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
