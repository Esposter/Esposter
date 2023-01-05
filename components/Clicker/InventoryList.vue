<script setup lang="ts">
import { useGameStore } from "@/store/clicker/useGameStore";
import { storeToRefs } from "pinia";

const gameStore = useGameStore();
const { game } = $(storeToRefs(gameStore));
</script>

<template>
  <v-list overflow-y="auto!">
    <ClickerModelUpgradeListGroup :upgrades="game.boughtUpgrades" />
  </v-list>
</template>
