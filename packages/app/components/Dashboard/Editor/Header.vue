<script setup lang="ts">
import { VisualType } from "@/models/dashboard/VisualType";
import { RoutePath } from "@/models/router/RoutePath";
import { useVisualStore } from "@/store/dashboard/visual";

const visualStore = useVisualStore();
const { createVisual } = visualStore;
const { selectedVisualType } = storeToRefs(visualStore);
</script>

<template>
  <v-toolbar>
    <v-toolbar-title font-bold="!">
      <div pt-4 flex flex-col justify-between pr-4 gap-y-4>
        <div>Dashboard Editor</div>
        <div w-full flex items-center>
          <v-select v-model="selectedVisualType" :items="Object.values(VisualType)" label="Visual Type" hide-details />
          <v-divider mx-4="!" thickness="2" vertical inset />
          <v-tooltip :text="`Add ${selectedVisualType} Visual`">
            <template #activator="{ props }">
              <v-btn ml-2 variant="elevated" :flat="false" :="props" @click="createVisual">
                <v-icon icon="mdi-plus" />
              </v-btn>
            </template>
          </v-tooltip>
          <v-tooltip text="Dashboard">
            <template #activator="{ props }">
              <v-btn ml-2 variant="elevated" :flat="false" :="props" @click="navigateTo(RoutePath.Dashboard)">
                <v-icon icon="mdi-view-dashboard" />
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
