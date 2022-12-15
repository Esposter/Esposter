<script setup lang="ts">
import type { Upgrade } from "@/models/clicker";
import { UpgradeLocation } from "@/models/clicker";

interface CursorUpgradeListGroupProps {
  upgrades: Upgrade[];
}

const props = defineProps<CursorUpgradeListGroupProps>();
const { upgrades } = $(toRefs(props));
const autoClickUpgrades = $computed(() => upgrades.filter((u) => u.upgradeLocation === UpgradeLocation.AutoClick));
</script>

<template>
  <v-list-group v-if="autoClickUpgrades.length > 0">
    <template #activator="{ props: listProps }">
      <v-list-item :="listProps">
        <template #prepend>
          <v-avatar color="background">
            <v-icon icon="mdi-cursor-pointer" />
          </v-avatar>
        </template>
        <v-list-item-title font="bold!">Auto Click</v-list-item-title>
      </v-list-item>
    </template>
    <ClickerModelUpgradeListItem
      v-for="autoClickUpgrade in autoClickUpgrades"
      :key="autoClickUpgrade.name"
      :upgrade="autoClickUpgrade"
    />
  </v-list-group>
</template>
