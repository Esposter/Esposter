<script setup lang="ts">
import { useGameStore } from "@/store/clicker/useGameStore";
import { VList } from "vuetify/lib/components";
import { ClickerModelUpgradeListGroup } from "~~/.nuxt/components";

const gameStore = useGameStore();
const { game } = $(storeToRefs(gameStore));
</script>

<template>
  <v-list overflow-y="auto!">
    <ClickerModelUpgradeListGroup :upgrades="game.boughtUpgrades" />
  </v-list>
</template>
