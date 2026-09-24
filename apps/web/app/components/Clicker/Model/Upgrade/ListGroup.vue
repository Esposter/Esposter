<script setup lang="ts">
import type { Upgrade } from "#shared/models/clicker/data/upgrade/Upgrade";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface Props {
  isBought?: true;
  upgrades: Upgrade[];
}

const { isBought, upgrades } = defineProps<Props>();
</script>

<template>
  <ClickerModelListGroup
    v-if="upgrades.length > 0"
    :count="upgrades.length"
    :meaning="UiIconMeaning.Upgrade"
    title="Upgrades"
  >
    <ClickerModelUpgradeListItem v-for="upgrade of upgrades" :key="upgrade.id" :upgrade :is-bought />
  </ClickerModelListGroup>
</template>
