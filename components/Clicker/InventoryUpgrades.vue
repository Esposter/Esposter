<script setup lang="ts">
import { useGameStore } from "@/store/clicker/useGameStore";
import { storeToRefs } from "pinia";

const gameStore = useGameStore();
const { game } = $(storeToRefs(gameStore));
</script>

<template>
  <ClickerModelUpgradeList v-if="game" :upgrades="game.boughtUpgrades" :is-bought="true" />
</template>
