import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";

import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";

export const ColumnTypeItemCategoryDefinitions: SelectItemCategoryDefinition<ColumnType>[] = Object.values(ColumnType)
  .filter((type) => type !== ColumnType.Computed)
  .map((type) => ({ title: type, value: type }));
