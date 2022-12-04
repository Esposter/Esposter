<script setup lang="ts">
import type { Upgrade } from "@/models/clicker";
import { UpgradeTarget } from "@/models/clicker";

interface UpgradeListProps {
  upgrades: Upgrade[];
  isBought?: true;
}

const props = defineProps<UpgradeListProps>();
const { upgrades, isBought } = $(toRefs(props));
const cursorUpgrades = $computed(() => upgrades.filter((u) => u.upgradeTarget === UpgradeTarget.Cursor));
</script>

<template>
  <v-list>
    <v-list-group v-if="cursorUpgrades.length > 0">
      <template #activator="{ props: listProps }">
        <v-list-item :="listProps">
          <template #prepend>
            <v-avatar color="background">
              <v-icon icon="mdi-cursor-pointer" />
            </v-avatar>
          </template>
          <v-list-item-title font="bold!">Cursor</v-list-item-title>
        </v-list-item>
      </template>
      <ClickerModelUpgradeListItem
        v-for="cursorUpgrade in cursorUpgrades"
        :key="cursorUpgrade.name"
        :upgrade="cursorUpgrade"
        :is-bought="isBought"
      />
    </v-list-group>
  </v-list>
</template>
