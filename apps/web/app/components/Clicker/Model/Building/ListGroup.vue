<script setup lang="ts">
import type { Building } from "#shared/models/clicker/data/building/Building";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface Props {
  buildings: Building[];
}

const { buildings } = defineProps<Props>();
</script>

<template>
  <ClickerModelListGroup
    v-if="buildings.length > 0"
    :count="buildings.length"
    :meaning="UiIconMeaning.Building"
    title="Buildings"
  >
    <ClickerModelBuildingListItem v-for="building of buildings" :key="building.id" :building />
  </ClickerModelListGroup>
</template>
