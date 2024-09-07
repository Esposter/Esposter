<script setup lang="ts">
import { ITEM_TYPE_QUERY_PARAM_KEY } from "@/services/shared/constants";
import { tableEditorTypeItemCategoryDefinitions } from "@/services/tableEditor/tableEditorTypeItemCategoryDefinitions";
import { useTableEditorStore } from "@/store/tableEditor";

const router = useRouter();
const tableEditorStore = useTableEditorStore();
const { tableEditorType } = storeToRefs(tableEditorStore);
</script>

<template>
  <v-select
    v-model="tableEditorType"
    :items="tableEditorTypeItemCategoryDefinitions"
    hide-details
    @update:model-value="
      (value) => router.replace({ query: { ...router.currentRoute.value.query, [ITEM_TYPE_QUERY_PARAM_KEY]: value } })
    "
  />
</template>
