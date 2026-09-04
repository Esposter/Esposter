<script setup lang="ts">
import type { Upgrade } from "#shared/models/clicker/data/upgrade/Upgrade";

interface Props {
  isBought?: true;
  upgrades: Upgrade[];
}

const { isBought, upgrades } = defineProps<Props>();
</script>

<template>
  <ClickerModelListGroup v-if="upgrades.length > 0" icon="mdi-gesture-swipe-up" title="Upgrades">
    <ClickerModelUpgradeListItem v-for="upgrade of upgrades" :key="upgrade.id" :upgrade :is-bought />
  </ClickerModelListGroup>
</template>
