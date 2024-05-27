<script setup lang="ts">
import { useClickerStore } from "@/store/clicker";

const clickerStore = useClickerStore();
const { game } = storeToRefs(clickerStore);
const inventoryUpgrades = computed(() => game.value.boughtUpgrades.toSorted((a, b) => a.price - b.price));
</script>

<template>
  <v-list overflow-y-auto="!">
    <ClickerModelUpgradeListGroup :upgrades="inventoryUpgrades" is-bought />
  </v-list>
</template>
