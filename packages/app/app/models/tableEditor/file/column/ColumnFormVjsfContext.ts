import type { Column } from "#shared/models/tableEditor/file/column/Column";
import type { VjsfOptions } from "@/models/vjsf/VjsfOptions";
import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";

import { getPropertyNames } from "@esposter/shared";

export interface ColumnFormVjsfContext {
  booleanColumnItems: SelectItemCategoryDefinition<Column["id"]>[];
  columnItems: SelectItemCategoryDefinition<Column["id"]>[];
  columnNames: Column["name"][];
  computedColumnItems: SelectItemCategoryDefinition<Column["id"]>[];
  currentName: Column["name"];
  dateColumnItems: SelectItemCategoryDefinition<Column["id"]>[];
  numberColumnItems: SelectItemCategoryDefinition<Column["id"]>[];
  stringColumnItems: SelectItemCategoryDefinition<Column["id"]>[];
}

export const ColumnFormVjsfContextPropertyNames =
  getPropertyNames<Pick<VjsfOptions<ColumnFormVjsfContext>, "context">>();
