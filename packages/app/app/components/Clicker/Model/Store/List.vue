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
    .filter((u) => !clicker.value.boughtUpgrades.some((bu) => bu.id === u.id))
    .toSorted((a, b) => a.price - b.price),
);

initializeUpgradeMap(await $trpc.clicker.readUpgradeMap.query());
initializeBuildingMap(await $trpc.clicker.readBuildingMap.query());
</script>

<template>
  <v-list overflow-y-auto="!">
    <ClickerModelUpgradeListGroup :upgrades="unlockedStoreUpgrades" />
    <ClickerModelBuildingListGroup :buildings />
  </v-list>
</template>
