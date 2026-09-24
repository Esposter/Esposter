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
    <div px-4 py-6 flex flex-col h-full items-center ui-body>
      <ClickerHeader />
      <div flex flex-1 flex-col items-center justify-center>
        <ClickerModelPointsTitle />
        <ClickerContent />
      </div>
    </div>
    <ClickerModelPointsPopups />
    <ClickerOfflineProgressDialog />
    <template #left>
      <ClickerModelStoreHeader />
      <ClickerModelStoreList />
    </template>
    <template #right>
      <ClickerModelInventoryHeader />
      <ClickerModelInventoryList />
    </template>
  </NuxtLayout>
</template>
