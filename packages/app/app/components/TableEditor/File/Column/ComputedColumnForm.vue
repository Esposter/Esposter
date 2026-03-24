<script setup lang="ts">
import type { ComputedColumn } from "#shared/models/tableEditor/file/column/ComputedColumn";
import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";

import { ColumnTransformationTypeCreateMap } from "@/services/tableEditor/file/column/transformation/ColumnTransformationTypeCreateMap";
import { ColumnTransformationTypeItemCategoryDefinitions } from "@/services/tableEditor/file/column/transformation/ColumnTransformationTypeItemCategoryDefinitions";
import { Vjsf } from "@koumoul/vjsf";

interface ComputedColumnFormProps {
  dataSource: DataSource;
}

const editedColumn = defineModel<ComputedColumn>({ required: true });
const { dataSource } = defineProps<ComputedColumnFormProps>();
const transformationType = computed({
  get: () => editedColumn.value.transformation.type,
  set: (newType) => {
    const { sourceColumnId } = editedColumn.value.transformation;
    editedColumn.value.transformation = { ...ColumnTransformationTypeCreateMap[newType].create(), sourceColumnId };
  },
});
const { jsonSchema: columnTransformationJsonSchema, options } = useColumnTransformationJsonSchema(
  () => transformationType.value,
  () => dataSource,
);
</script>

<template>
  <v-select
    v-model="transformationType"
    :items="ColumnTransformationTypeItemCategoryDefinitions"
    label="Transformation"
  />
  <Vjsf v-model="editedColumn.transformation" :schema="columnTransformationJsonSchema" :options />
</template>
