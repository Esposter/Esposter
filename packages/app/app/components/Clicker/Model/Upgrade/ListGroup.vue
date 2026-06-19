<script setup lang="ts">
import type { Upgrade } from "#shared/models/clicker/data/upgrade/Upgrade";

interface UpgradeListGroupProps {
  isBought?: true;
  upgrades: Upgrade[];
}

const { isBought, upgrades } = defineProps<UpgradeListGroupProps>();
const hasUpgrades = computed(() => upgrades.length > 0);
</script>

<template>
  <ClickerModelListGroup v-if="hasUpgrades" icon="mdi-gesture-swipe-up" title="Upgrades">
    <ClickerModelUpgradeListItem v-for="upgrade of upgrades" :key="upgrade.id" :upgrade :is-bought />
  </ClickerModelListGroup>
</template>
