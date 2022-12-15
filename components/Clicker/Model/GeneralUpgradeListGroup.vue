<script setup lang="ts">
import type { Upgrade } from "@/models/clicker";
import { UpgradeLocation } from "@/models/clicker";

interface CursorUpgradeListGroupProps {
  upgrades: Upgrade[];
  isBought?: true;
}

const props = defineProps<CursorUpgradeListGroupProps>();
const { upgrades, isBought } = $(toRefs(props));
const generalUpgrades = $computed(() => upgrades.filter((u) => u.upgradeLocation === UpgradeLocation.General));
</script>

<template>
  <v-list-group v-if="generalUpgrades.length > 0">
    <template #activator="{ props: listProps }">
      <v-list-item :="listProps">
        <template #prepend>
          <v-avatar color="background">
            <v-icon icon="mdi-gesture-swipe-up" />
          </v-avatar>
        </template>
        <v-list-item-title font="bold!">General</v-list-item-title>
      </v-list-item>
    </template>
    <ClickerModelUpgradeListItem
      v-for="generalUpgrade in generalUpgrades"
      :key="generalUpgrade.name"
      :upgrade="generalUpgrade"
      :is-bought="isBought"
    />
  </v-list-group>
</template>
