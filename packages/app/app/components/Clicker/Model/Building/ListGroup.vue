<script setup lang="ts">
import type { Building } from "#shared/models/clicker/data/building/Building";

interface BuildingListGroupProps {
  buildings: Building[];
}

const { buildings } = defineProps<BuildingListGroupProps>();
</script>

<template>
  <ClickerModelListGroup v-if="buildings.length > 0" icon="mdi-domain" title="Buildings">
    <ClickerModelBuildingListItem v-for="building of buildings" :key="building.id" :building />
  </ClickerModelListGroup>
</template>
