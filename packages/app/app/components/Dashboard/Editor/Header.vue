<script setup lang="ts">
import { visualTypeItemCategoryDefinitions } from "@/services/dashboard/visualTypeItemCategoryDefinitions";
import { ITEM_TYPE_QUERY_PARAMETER_KEY } from "@/services/shared/constants";
import { useVisualStore } from "@/store/dashboard/visual";
import { prettify } from "@/util/text/prettify";
import { RoutePath } from "@esposter/shared";

const visualStore = useVisualStore();
const { createVisual } = visualStore;
const { visualType } = storeToRefs(visualStore);
</script>

<template>
  <v-toolbar>
    <v-toolbar-title font-bold px-4>
      <div flex flex-col justify-between gap-y-4 pt-4>
        <div>Dashboard Editor</div>
        <div w-full flex items-center>
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
          <v-divider thickness="2" vertical inset mx-4 />
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
