<script setup lang="ts">
import type { AColumn } from "#shared/models/tableEditor/file/AColumn";
import type { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import type { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";
import type { TodoListItem } from "#shared/models/tableEditor/todoList/TodoListItem";
import type { VuetifyComponentItem } from "#shared/models/tableEditor/vuetifyComponent/VuetifyComponentItem";

import { ADataSourceItem, aDataSourceItemSchema } from "#shared/models/tableEditor/file/ADataSourceItem";
import { DefaultPropsMap } from "@/services/tableEditor/DefaultPropsMap";
import { getItemCategoryDefinition } from "@/services/tableEditor/getItemCategoryDefinition";
import { useTableEditorStore } from "@/store/tableEditor";

interface TableEditorCrudViewFirstColumnSlotProps {
  item: ADataSourceItem<DataSourceType> | TodoListItem | VuetifyComponentItem;
}

const { item } = defineProps<TableEditorCrudViewFirstColumnSlotProps>();
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
