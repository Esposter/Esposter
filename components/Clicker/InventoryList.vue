<script setup lang="ts">
import { useGameStore } from "@/store/clicker/useGameStore";
import { storeToRefs } from "pinia";

const gameStore = useGameStore();
const { game } = $(storeToRefs(gameStore));
const inventoryUpgrades = $computed(() => {
  if (!game) return [];
  return game.boughtUpgrades;
});
</script>

<template>
  <v-list overflow-y="auto!">
    <ClickerModelUpgradeListGroup :upgrades="inventoryUpgrades" />
  </v-list>
</template>
