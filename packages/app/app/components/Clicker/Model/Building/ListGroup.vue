<script setup lang="ts">
import type { Building } from "#shared/models/clicker/data/building/Building";

interface Props {
  buildings: Building[];
}

const { buildings } = defineProps<Props>();
</script>

<template>
  <ClickerModelListGroup v-if="buildings.length > 0" icon="mdi-domain" title="Buildings">
    <ClickerModelBuildingListItem v-for="building of buildings" :key="building.id" :building />
  </ClickerModelListGroup>
</template>
