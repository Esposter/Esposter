<script setup lang="ts">
import { DashboardVisualType } from "@/models/dashboard/DashboardVisualType";
import { useLayoutStore } from "@/store/dashboard/layout";

const layoutStore = useLayoutStore();
const { pushVisual } = layoutStore;
const { selectedVisualType } = storeToRefs(layoutStore);
</script>

<template>
  <v-toolbar>
    <v-toolbar-title font-bold="!">
      <div pt-4 flex items-center justify-between>
        Dashboard Layout Editor
        <div w-full flex items-center pl-4 mr-2>
          <v-select
            v-model="selectedVisualType"
            :items="Object.values(DashboardVisualType)"
            label="Visual Type"
            hide-details
          />
          <v-tooltip :text="`Add ${selectedVisualType} Visual`">
            <template #activator="{ props }">
              <v-btn ml-2 variant="elevated" :flat="false" :="props" @click="pushVisual">
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
