<script setup lang="ts">
import type { ColumnTransformation } from "#shared/models/tableEditor/file/ColumnTransformation";
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";

import type { ComputedColumn } from "#shared/models/tableEditor/file/ComputedColumn";

import { ComputedColumnTransformationFormSchemaMap } from "#shared/models/tableEditor/file/ComputedColumnTransformationFormSchemaMap";
import {
  ColumnTransformationType,
  DatePartType,
  MathOperationType,
} from "#shared/models/tableEditor/file/ColumnTransformationType";
import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import { DATE_FORMATS } from "#shared/models/tableEditor/file/constants";
import { zodToJsonSchema } from "@/services/jsonSchema/zodToJsonSchema";
import { ColumnTransformationTypeItemCategoryDefinitions } from "@/services/tableEditor/file/column/ColumnTransformationTypeItemCategoryDefinitions";
import { takeOne } from "@esposter/shared";
import { Vjsf } from "@koumoul/vjsf";

interface ComputedColumnFormProps {
  dataSource: DataSource;
}

const { dataSource } = defineProps<ComputedColumnFormProps>();
const editedColumn = defineModel<ComputedColumn>({ required: true });
const transformationType = ref(ColumnTransformationType.ConvertTo);
const sourceColumns = computed(() => dataSource.columns.filter((column) => column.type !== ColumnType.Computed));
const sourceColumnItems = computed(() =>
  sourceColumns.value.map((column) => ({ title: column.name, value: column.id })),
);
const transformationJsonSchema = computed(() =>
  zodToJsonSchema(takeOne(ComputedColumnTransformationFormSchemaMap, transformationType.value)),
);
const transformationModel = computed({
  get: () => {
    const { type: _type, ...rest } = editedColumn.value.transformation;
    return rest;
  },
  set: (formValue) => {
    // `as` required: TypeScript cannot narrow a discriminated union from a dynamic spread
    editedColumn.value.transformation = { ...formValue, type: transformationType.value } as ColumnTransformation;
  },
});

watch(transformationType, (newTransformationType, oldTransformationType) => {
  if (newTransformationType === oldTransformationType) return;
  switch (newTransformationType) {
    case ColumnTransformationType.ConvertTo:
      editedColumn.value.transformation = { type: newTransformationType, targetType: ColumnType.String };
      break;
    case ColumnTransformationType.DatePart:
      editedColumn.value.transformation = {
        type: newTransformationType,
        part: DatePartType.Year,
        inputFormat: takeOne(DATE_FORMATS, 7),
      };
      break;
    case ColumnTransformationType.ExtractPattern:
      editedColumn.value.transformation = { type: newTransformationType, pattern: "", groupIndex: 0 };
      break;
    case ColumnTransformationType.MathOperation:
      editedColumn.value.transformation = {
        type: newTransformationType,
        operation: MathOperationType.Multiply,
        operand: 1,
      };
      break;
  }
});
</script>

<template>
  <v-select
    v-model="transformationType"
    :items="ColumnTransformationTypeItemCategoryDefinitions"
    label="Transformation"
  />
  <v-select v-model="editedColumn.sourceColumnId" :items="sourceColumnItems" label="Source Column" />
  <Vjsf v-model="transformationModel" :schema="transformationJsonSchema" />
</template>
