import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";

import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";

export const ColumnTypeItemCategoryDefinitions: SelectItemCategoryDefinition<ColumnType>[] = [
  { title: "Standard", value: ColumnType.String },
  { title: ColumnType.Date, value: ColumnType.Date },
  { title: ColumnType.Computed, value: ColumnType.Computed },
];
