<script setup lang="ts">
import type { Upgrade } from "#shared/models/clicker/data/upgrade/Upgrade";

interface UpgradeListGroupProps {
  isBought?: boolean;
  upgrades: Upgrade[];
}

const { isBought = false, upgrades } = defineProps<UpgradeListGroupProps>();
const hasUpgrades = computed(() => upgrades.length > 0);
</script>

<template>
  <v-list-group v-if="hasUpgrades">
    <template #activator="{ props: listProps }">
      <v-list-item :="listProps">
        <template #prepend>
          <v-avatar color="background">
            <v-icon icon="mdi-gesture-swipe-up" />
          </v-avatar>
        </template>
        <v-list-item-title font-bold="!">Upgrades</v-list-item-title>
      </v-list-item>
    </template>
    <ClickerModelUpgradeListItem v-for="upgrade of upgrades" :key="upgrade.id" :upgrade :is-bought />
  </v-list-group>
</template>
