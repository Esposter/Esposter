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
  <StyledPageHeader>
    <template #filters>
      <v-select
        v-model="visualType"
        max-width="16rem"
        label="Visual Type"
        hide-details
        :items="visualTypeItemCategoryDefinitions"
        @update:model-value="
          $router.replace({
            query: { ...$router.currentRoute.value.query, [ITEM_TYPE_QUERY_PARAMETER_KEY]: $event },
          })
        "
      />
    </template>
    <template #actions>
      <v-tooltip :text="`Add ${prettify(visualType)} Visual`">
        <template #activator="{ props }">
          <v-btn variant="elevated" :flat="false" :="props" @click="createVisual">
            <v-icon icon="mdi-plus" />
          </v-btn>
        </template>
      </v-tooltip>
      <v-tooltip text="Dashboard">
        <template #activator="{ props }">
          <v-btn variant="elevated" :flat="false" :="props" @click="navigateTo(RoutePath.Dashboard)">
            <v-icon icon="mdi-view-dashboard" />
          </v-btn>
        </template>
      </v-tooltip>
    </template>
  </StyledPageHeader>
</template>
