<script setup lang="ts">
import { useClickerStore } from "@/store/clicker";
import { useBuildingStore } from "@/store/clicker/building";
import { useUpgradeStore } from "@/store/clicker/upgrade";

const { $trpc } = useNuxtApp();
const clickerStore = useClickerStore();
const { clicker } = storeToRefs(clickerStore);
const upgradeStore = useUpgradeStore();
const { initializeUpgradeMap } = upgradeStore;
const { unlockedUpgrades } = storeToRefs(upgradeStore);
const buildingStore = useBuildingStore();
const { initializeBuildingMap } = buildingStore;
const { buildings } = storeToRefs(buildingStore);
const unlockedStoreUpgrades = computed(() =>
  unlockedUpgrades.value
    .filter(
      (unlockedUpgrade) =>
        !clicker.value.boughtUpgrades.some((boughtUpgrade) => boughtUpgrade.id === unlockedUpgrade.id),
    )
    .toSorted((firstUpgrade, secondUpgrade) => firstUpgrade.price - secondUpgrade.price),
);

const [upgradeMap, buildingMap] = await Promise.all([
  $trpc.clicker.readUpgradeMap.query(),
  $trpc.clicker.readBuildingMap.query(),
]);

initializeUpgradeMap(upgradeMap);
initializeBuildingMap(buildingMap);
</script>

<template>
  <v-list overflow-y-auto>
    <ClickerModelUpgradeListGroup :upgrades="unlockedStoreUpgrades" />
    <ClickerModelBuildingListGroup :buildings />
  </v-list>
</template>
