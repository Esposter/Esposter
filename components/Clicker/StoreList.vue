<script setup lang="ts">
import { useBuildingStore } from "@/store/clicker/useBuildingStore";
import { useGameStore } from "@/store/clicker/useGameStore";
import { useUpgradeStore } from "@/store/clicker/useUpgradeStore";
import { storeToRefs } from "pinia";

const { $client } = useNuxtApp();
const gameStore = useGameStore();
const { game } = $(storeToRefs(gameStore));
const upgradeStore = useUpgradeStore();
const { initialiseUpgradeList } = upgradeStore;
const { upgradeList } = $(storeToRefs(upgradeStore));
const buildingStore = useBuildingStore();
const { initialiseBuildingList } = buildingStore;
const { buildingList } = $(storeToRefs(buildingStore));
const storeUpgrades = $computed(() => {
  if (!game) return [];
  return upgradeList.filter((u) => !game.boughtUpgrades.find((bu) => bu.name === u.name));
});

const upgrades = await $client.clicker.readUpgrades.query();
if (upgrades) initialiseUpgradeList(upgrades);

const buildings = await $client.clicker.readBuildings.query();
if (buildings) initialiseBuildingList(buildings);
</script>

<template>
  <v-list>
    <ClickerModelUpgradeListGroup :upgrades="storeUpgrades" is-buyable />
    <ClickerModelBuildingListGroup :buildings="buildingList" />
  </v-list>
</template>
