<script setup lang="ts">
import { useGameStore } from "@/store/clicker/useGameStore";
import { useUpgradeStore } from "@/store/clicker/useUpgradeStore";
import { storeToRefs } from "pinia";

const { $client } = useNuxtApp();
const gameStore = useGameStore();
const { game } = $(storeToRefs(gameStore));
const upgradeStore = useUpgradeStore();
const { initialiseUpgradeList } = upgradeStore;
const { upgradeList } = $(storeToRefs(upgradeStore));
const storeUpgrades = $computed(() =>
  upgradeList.filter((u) => game && !game.boughtUpgradeList.find((bu) => bu.name === u.name))
);

const upgrades = await $client.clicker.readUpgrades.query();
if (upgrades) initialiseUpgradeList(upgrades);
</script>

<template>
  <ClickerModelUpgradeList v-if="storeUpgrades" :upgrades="storeUpgrades" />
</template>
