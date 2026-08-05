<script setup lang="ts">
import { visualTypeItemCategoryDefinitions } from "@/services/dashboard/visualTypeItemCategoryDefinitions";
import { ITEM_TYPE_QUERY_PARAMETER_KEY } from "@/services/shared/constants";
import { useVisualStore } from "@/store/dashboard/visual";
import { prettify } from "@/util/text/prettify";

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
      <StyledTooltipIconButton icon="mdi-plus" :text="`Add ${prettify(visualType)} Visual`" @click="createVisual" />
    </template>
  </StyledPageHeader>
</template>
