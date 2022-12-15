<script setup lang="ts">
import type { Upgrade } from "@/models/clicker";

interface UpgradeListProps {
  upgrades: Upgrade[];
  isBought?: true;
}

const props = defineProps<UpgradeListProps>();
const { upgrades, isBought } = $(toRefs(props));
</script>

<template>
  <v-list>
    <ClickerModelGeneralUpgradeListGroup :upgrades="upgrades" :is-bought="isBought" />
    <ClickerModelAutoClickUpgradeListGroup :upgrades="upgrades" />
  </v-list>
</template>
