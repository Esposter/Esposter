import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { VjsfOptions } from "@/models/vjsf/VjsfOptions";
import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";

import { getPropertyNames } from "@esposter/shared";

export interface ColumnFormVjsfContext {
  columnItems: SelectItemCategoryDefinition<Column["id"]>[];
  dateColumnItems: SelectItemCategoryDefinition<Column["id"]>[];
  numberColumnItems: SelectItemCategoryDefinition<Column["id"]>[];
  stringColumnItems: SelectItemCategoryDefinition<Column["id"]>[];
}

export const ColumnFormVjsfContextPropertyNames =
  getPropertyNames<Pick<VjsfOptions<ColumnFormVjsfContext>, "context">>();
