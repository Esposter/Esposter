<script setup lang="ts">
import type { ComputedColumn } from "#shared/models/tableEditor/file/column/ComputedColumn";

import { ColumnTransformationSchemaMap } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationSchemaMap";
import { zodToJsonSchema } from "@/services/jsonSchema/zodToJsonSchema";
import { ColumnTransformationTypeCreateMap } from "@/services/tableEditor/file/column/transformation/ColumnTransformationTypeCreateMap";
import { ColumnTransformationTypeItemCategoryDefinitions } from "@/services/tableEditor/file/column/transformation/ColumnTransformationTypeItemCategoryDefinitions";
import { takeOne } from "@esposter/shared";
import { Vjsf } from "@koumoul/vjsf";

const editedColumn = defineModel<ComputedColumn>({ required: true });
const transformationType = computed({
  get: () => editedColumn.value.transformation.type,
  set: (newType) => {
    const { sourceColumnId } = editedColumn.value.transformation;
    editedColumn.value.transformation = { ...ColumnTransformationTypeCreateMap[newType].create(), sourceColumnId };
  },
});
const columnTransformationJsonSchema = computed(() =>
  zodToJsonSchema(takeOne(ColumnTransformationSchemaMap, transformationType.value)),
);
</script>

<template>
  <v-select
    v-model="transformationType"
    :items="ColumnTransformationTypeItemCategoryDefinitions"
    label="Transformation"
  />
  <Vjsf v-model="editedColumn.transformation" :schema="columnTransformationJsonSchema" />
</template>
