<script setup lang="ts">
import { formatNumberLong } from "@/services/clicker/format";
import { useClickerStore } from "@/store/clicker";

await useReadClicker();
useTimers();
const clickerStore = useClickerStore();
const { clicker } = storeToRefs(clickerStore);
const clickerItemProperties = useClickerItemProperties();
const displayNoPoints = computed(() => formatNumberLong(clicker.value.noPoints, 3));
</script>

<template>
  <NuxtLayout>
    <Head>
      <Title>{{ displayNoPoints }} {{ clickerItemProperties.pluralName }}</Title>
    </Head>
    <v-container h-full flex justify-center items-center flex-col>
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

<style scoped lang="scss">
:deep(.v-list-group__items > .v-list-item) {
  padding-inline-start: 1rem !important;
}
</style>
