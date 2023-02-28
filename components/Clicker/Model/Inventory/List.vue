<script setup lang="ts">
import { useGameStore } from "@/store/clicker/game";

const gameStore = useGameStore();
const { game } = $(storeToRefs(gameStore));
const inventoryUpgrades = $computed(() => game.boughtUpgrades.sort((a, b) => a.price - b.price));
</script>

<template>
  <v-list overflow-y="auto!">
    <ClickerModelUpgradeListGroup :upgrades="inventoryUpgrades" />
  </v-list>
</template>
