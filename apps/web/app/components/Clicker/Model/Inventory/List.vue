<script setup lang="ts">
import { useClickerStore } from "@/store/clicker";

const clickerStore = useClickerStore();
const { clicker } = storeToRefs(clickerStore);
const inventoryUpgrades = computed(() =>
  clicker.value.boughtUpgrades.toSorted((firstUpgrade, secondUpgrade) => firstUpgrade.price - secondUpgrade.price),
);
</script>

<template>
  <v-list overflow-y-auto>
    <ClickerModelUpgradeListGroup :upgrades="inventoryUpgrades" is-bought />
  </v-list>
</template>
