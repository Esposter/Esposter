<script setup lang="ts">
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useUpgradeStore } from "@/store/clicker/upgrade";

const upgradeStore = useUpgradeStore();
const { boughtUpgrades } = storeToRefs(upgradeStore);
</script>

<template>
  <div px-2 pb-2 flex flex-col gap-2 of-y-auto>
    <ClickerModelUpgradeListGroup v-if="boughtUpgrades.length > 0" :upgrades="boughtUpgrades" is-bought />
    <UiEmptyState
      v-else
      description="Upgrades bought in the store land here."
      :meaning="UiIconMeaning.Achievement"
      title="No upgrades yet"
    />
  </div>
</template>
