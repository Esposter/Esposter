<script setup lang="ts">
import { useBuildingStore } from "@/store/clicker/building";
import { useUpgradeStore } from "@/store/clicker/upgrade";

const { $trpc } = useNuxtApp();
const upgradeStore = useUpgradeStore();
const { initializeUpgradeMap } = upgradeStore;
const { availableUpgrades } = storeToRefs(upgradeStore);
const buildingStore = useBuildingStore();
const { initializeBuildingMap } = buildingStore;
const { buildings } = storeToRefs(buildingStore);
const [upgradeMap, buildingMap] = await Promise.all([
  $trpc.clicker.readUpgradeMap.query(),
  $trpc.clicker.readBuildingMap.query(),
]);

initializeUpgradeMap(upgradeMap);
initializeBuildingMap(buildingMap);
</script>

<template>
  <div px-2 pb-2 flex flex-col gap-2 of-y-auto>
    <ClickerModelUpgradeListGroup :upgrades="availableUpgrades" />
    <ClickerModelBuildingListGroup :buildings />
  </div>
</template>
