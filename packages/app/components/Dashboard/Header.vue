<script setup lang="ts">
import { DashboardVisualType } from "@/models/dashboard/DashboardVisualType";
import { useLayoutStore } from "@/store/dashboard/layout";

const layoutStore = useLayoutStore();
const { pushDashboardVisual } = layoutStore;
const { selectedDashboardVisualType } = storeToRefs(layoutStore);
</script>

<template>
  <v-toolbar>
    <v-toolbar-title font-bold="!">
      <div pt-4 flex items-center justify-between>
        Dashboard Layout Editor
        <div w-full flex items-center pl-4 mr-2>
          <v-select
            v-model="selectedDashboardVisualType"
            :items="Object.values(DashboardVisualType)"
            label="Visual Type"
            hide-details
          />
          <v-tooltip :text="`Add ${selectedDashboardVisualType} Visual`">
            <template #activator="{ props }">
              <v-btn ml-2 variant="elevated" :flat="false" :="props" @click="pushDashboardVisual">
                <v-icon icon="mdi-plus" />
              </v-btn>
            </template>
          </v-tooltip>
        </div>
      </div>
    </v-toolbar-title>
  </v-toolbar>
</template>

<style scoped lang="scss">
:deep(.v-toolbar__content) {
  height: auto !important;
}
</style>
