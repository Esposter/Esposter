<script setup lang="ts">
import type { Building } from "@/models/clicker/data/building/Building";

interface BuildingListGroupProps {
  buildings: Building[];
}

const { buildings } = defineProps<BuildingListGroupProps>();
const hasBuildings = computed(() => buildings.length > 0);
</script>

<template>
  <v-list-group v-if="hasBuildings">
    <template #activator="{ props: listProps }">
      <v-list-item :="listProps">
        <template #prepend>
          <v-avatar color="background">
            <v-icon icon="mdi-domain" />
          </v-avatar>
        </template>
        <v-list-item-title font-bold="!">Buildings</v-list-item-title>
      </v-list-item>
    </template>
    <ClickerModelBuildingListItem v-for="building of buildings" :key="building.id" :building />
  </v-list-group>
</template>
