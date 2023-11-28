<script setup lang="ts">
import { useBuildingStore } from "@/store/clicker/building";
import { useGameStore } from "@/store/clicker/game";
import { useUpgradeStore } from "@/store/clicker/upgrade";

const { $client } = useNuxtApp();
const gameStore = useGameStore();
const { game } = storeToRefs(gameStore);
const upgradeStore = useUpgradeStore();
const { initialiseUpgradeList } = upgradeStore;
const { unlockedUpgrades } = storeToRefs(upgradeStore);
const buildingStore = useBuildingStore();
const { initialiseBuildingList } = buildingStore;
const { buildingList } = storeToRefs(buildingStore);
const unlockedStoreUpgrades = computed(() =>
  unlockedUpgrades.value
    .filter((u) => game.value && !game.value.boughtUpgrades.some((bu) => bu.name === u.name))
    .toSorted((a, b) => a.price - b.price),
);

const upgrades = await $client.clicker.readUpgrades.query();
initialiseUpgradeList(upgrades);

const buildings = await $client.clicker.readBuildings.query();
initialiseBuildingList(buildings);
</script>

<template>
  <v-list overflow-y-auto="!">
    <ClickerModelUpgradeListGroup :upgrades="unlockedStoreUpgrades" />
    <ClickerModelBuildingListGroup :buildings="buildingList" />
  </v-list>
</template>
