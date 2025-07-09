<script setup lang="ts">
import { ITEM_TYPE_QUERY_PARAMETER_KEY } from "@/services/shared/constants";
import { TableEditorTypeItemCategoryDefinitions } from "@/services/tableEditor/TableEditorTypeItemCategoryDefinitions";
import { useTableEditorStore } from "@/store/tableEditor";

const tableEditorStore = useTableEditorStore();
const { tableEditorType } = storeToRefs(tableEditorStore);
</script>

<template>
  <v-select
    v-model="tableEditorType"
    :items="TableEditorTypeItemCategoryDefinitions"
    hide-details
    @update:model-value="
      $router.replace({ query: { ...$router.currentRoute.value.query, [ITEM_TYPE_QUERY_PARAMETER_KEY]: $event } })
    "
  />
</template>
