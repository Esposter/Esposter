<script setup lang="ts">
import type { Building } from "@/models/clicker/Building";

interface BuildingListGroupProps {
  buildings: Building[];
}

const props = defineProps<BuildingListGroupProps>();
const { buildings } = $(toRefs(props));
</script>

<template>
  <v-list-group>
    <template #activator="{ props: listProps }">
      <v-list-item :="listProps">
        <template #prepend>
          <v-avatar color="background">
            <v-icon icon="mdi-domain" />
          </v-avatar>
        </template>
        <v-list-item-title font="bold!">Buildings</v-list-item-title>
      </v-list-item>
    </template>
    <ClickerModelBuildingListItem v-for="building in buildings" :key="building.name" :building="building" />
  </v-list-group>
</template>
