<script setup lang="ts">
import type { ADataSourceItem } from "#shared/models/tableEditor/file/ADataSourceItem";
import type { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";
import type { TodoListItem } from "#shared/models/tableEditor/todoList/TodoListItem";
import type { VuetifyComponentItem } from "#shared/models/tableEditor/vuetifyComponent/VuetifyComponentItem";

import { DefaultPropsMap } from "@/services/tableEditor/DefaultPropsMap";
import { getItemCategoryDefinition } from "@/services/tableEditor/getItemCategoryDefinition";
import { useTableEditorStore } from "@/store/tableEditor";

interface FirstColumnSlotProps {
  item: ADataSourceItem<DataSourceType> | TodoListItem | VuetifyComponentItem;
}

const { item } = defineProps<FirstColumnSlotProps>();
const tableEditorStore = useTableEditorStore();
const { tableEditorType } = storeToRefs(tableEditorStore);
const props = computed(() => DefaultPropsMap[tableEditorType.value]);
const itemCategoryDefinition = computed(() => getItemCategoryDefinition(props.value.itemCategoryDefinitions, item));
</script>

<template>
  <v-chip label>
    <v-icon pr-2 :icon="itemCategoryDefinition.icon" />
    {{ itemCategoryDefinition.title }}
  </v-chip>
</template>
