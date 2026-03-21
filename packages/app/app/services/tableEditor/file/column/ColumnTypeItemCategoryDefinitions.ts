import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";

import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";

export const ColumnTypeItemCategoryDefinitions: SelectItemCategoryDefinition<ColumnType>[] = Object.values(
  ColumnType,
).map((type) => ({ title: type, value: type }));
