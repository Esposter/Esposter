<script setup lang="ts">
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useClickerStore } from "@/store/clicker";

const clickerStore = useClickerStore();
const { clicker } = storeToRefs(clickerStore);
const inventoryUpgrades = computed(() =>
  clicker.value.boughtUpgrades.toSorted((firstUpgrade, secondUpgrade) => firstUpgrade.price - secondUpgrade.price),
);
</script>

<template>
  <div px-2 pb-2 flex flex-col gap-2 of-y-auto>
    <ClickerModelUpgradeListGroup v-if="inventoryUpgrades.length > 0" :upgrades="inventoryUpgrades" is-bought />
    <UiEmptyState
      v-else
      description="Upgrades bought in the store land here."
      :meaning="UiIconMeaning.Achievement"
      title="No upgrades yet"
    />
  </div>
</template>
