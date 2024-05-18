<script setup lang="ts">
import { useBuildingStore } from "@/store/clicker/building";
import { useGameStore } from "@/store/clicker/game";
import { useUpgradeStore } from "@/store/clicker/upgrade";

const { $client } = useNuxtApp();
const gameStore = useGameStore();
const { game } = storeToRefs(gameStore);
const upgradeStore = useUpgradeStore();
const { initializeUpgradeMap } = upgradeStore;
const { unlockedUpgrades } = storeToRefs(upgradeStore);
const buildingStore = useBuildingStore();
const { initializeBuildingMap } = buildingStore;
const { buildingList } = storeToRefs(buildingStore);
const unlockedStoreUpgrades = computed(() =>
  unlockedUpgrades.value
    .filter((u) => !game.value.boughtUpgrades.some((bu) => bu.id === u.id))
    .toSorted((a, b) => a.price - b.price),
);

initializeUpgradeMap(await $client.clicker.readUpgradeMap.query());
initializeBuildingMap(await $client.clicker.readBuildingMap.query());
</script>

<template>
  <v-list overflow-y-auto="!">
    <ClickerModelUpgradeListGroup :upgrades="unlockedStoreUpgrades" />
    <ClickerModelBuildingListGroup :buildings="buildingList" />
  </v-list>
</template>
