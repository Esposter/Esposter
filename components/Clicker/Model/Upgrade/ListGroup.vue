<script setup lang="ts">
import type { Upgrade } from "@/models/clicker/Upgrade";

interface UpgradeListGroupProps {
  upgrades: Upgrade[];
  isBought?: true;
}

const props = defineProps<UpgradeListGroupProps>();
const { upgrades, isBought } = toRefs(props);
const hasUpgrades = computed(() => upgrades.value.length > 0);
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
        <v-list-item-title font="bold!">Upgrades</v-list-item-title>
      </v-list-item>
    </template>
    <ClickerModelUpgradeListItem
      v-for="upgrade in upgrades"
      :key="upgrade.name"
      :upgrade="upgrade"
      :is-bought="isBought"
    />
  </v-list-group>
</template>
