<script setup lang="ts">
import type { Building } from "#shared/models/clicker/data/building/Building";

interface BuildingListGroupProps {
  buildings: Building[];
}

const { buildings } = defineProps<BuildingListGroupProps>();
const hasBuildings = computed(() => buildings.length > 0);
</script>

<template>
  <ClickerModelListGroup v-if="hasBuildings" icon="mdi-domain" title="Buildings">
    <ClickerModelBuildingListItem v-for="building of buildings" :key="building.id" :building />
  </ClickerModelListGroup>
</template>
