<script setup lang="ts">
import { VisualTypeItemCategoryDefinitions } from "@/services/dashboard/VisualTypeItemCategoryDefinitions";
import { ITEM_TYPE_QUERY_PARAMETER_KEY } from "@/services/shared/constants";
import { useVisualStore } from "@/store/dashboard/visual";
import { prettify } from "@/util/text/prettify";

const visualStore = useVisualStore();
const { createVisual } = visualStore;
const { visualType } = storeToRefs(visualStore);
</script>

<template>
  <v-toolbar px-4 py-2 b-0 b-b-1 b-border b-solid flex flex-wrap gap-2 items-center>
    <v-select
      v-model="visualType"
      density="comfortable"
      hide-details
      label="Visual Type"
      max-width="16rem"
      :items="VisualTypeItemCategoryDefinitions"
      @update:model-value="
        $router.replace({
          query: { ...$router.currentRoute.value.query, [ITEM_TYPE_QUERY_PARAMETER_KEY]: $event },
        })
      "
    />
    <v-spacer />
    <!-- v-toolbar provides variant="text" and the global VBtn default is flat, so this deliberately
      raised button has to restate both -->
    <StyledTooltipIconButton
      icon="mdi-plus"
      :button-props="{ flat: false, variant: 'elevated' }"
      :is-icon-button="false"
      :text="`Add ${prettify(visualType)} Visual`"
      @click="createVisual"
    />
  </v-toolbar>
</template>
