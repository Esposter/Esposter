import type { Component } from "vue";

import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import FieldInputBoolean from "@/components/TableEditor/File/Row/FieldInput/Boolean.vue";
import FieldInputDate from "@/components/TableEditor/File/Row/FieldInput/Date.vue";
import FieldInputText from "@/components/TableEditor/File/Row/FieldInput/Text.vue";

export const FieldInputComponentMap = {
  [ColumnType.Boolean]: FieldInputBoolean,
  [ColumnType.Date]: FieldInputDate,
  [ColumnType.Number]: FieldInputText,
  [ColumnType.String]: FieldInputText,
} as const satisfies Record<ColumnType, Component>;
