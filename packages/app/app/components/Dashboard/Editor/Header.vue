<script setup lang="ts">
import { RoutePath } from "#shared/models/router/RoutePath";
import { visualTypeItemCategoryDefinitions } from "@/services/dashboard/visualTypeItemCategoryDefinitions";
import { ITEM_TYPE_QUERY_PARAMETER_KEY } from "@/services/shared/constants";
import { useVisualStore } from "@/store/dashboard/visual";
import { prettify } from "@/util/text/prettify";

const visualStore = useVisualStore();
const { createVisual } = visualStore;
const { visualType } = storeToRefs(visualStore);
</script>

<template>
  <v-toolbar>
    <v-toolbar-title px-4 font-bold="!">
      <div flex flex-col pt-4 justify-between gap-y-4>
        <div>Dashboard Editor</div>
        <div flex items-center w-full>
          <v-select
            v-model="visualType"
            :items="visualTypeItemCategoryDefinitions"
            label="Visual Type"
            hide-details
            @update:model-value="
              $router.replace({
                query: { ...$router.currentRoute.value.query, [ITEM_TYPE_QUERY_PARAMETER_KEY]: $event },
              })
            "
          />
          <v-divider mx-4="!" thickness="2" vertical inset />
          <v-tooltip :text="`Add ${prettify(visualType)} Visual`">
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
