<script setup lang="ts">
import { useGameStore } from "@/store/clicker/useGameStore";
import { storeToRefs } from "pinia";

const { $client } = useNuxtApp();
const upgrades = await $client.clicker.readUpgrades.query();
const gameStore = useGameStore();
const { game } = $(storeToRefs(gameStore));
const storeUpgrades = $computed(() => upgrades?.filter((u) => !game?.boughtUpgrades.find((bu) => bu.name === u.name)));
</script>

<template>
  <ClickerModelUpgradeList v-if="storeUpgrades" :upgrades="storeUpgrades" />
</template>
