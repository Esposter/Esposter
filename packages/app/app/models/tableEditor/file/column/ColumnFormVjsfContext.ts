import type { VjsfOptions } from "@/models/vjsf/VjsfOptions";
import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";

import { getPropertyNames } from "@esposter/shared";

export interface ColumnFormVjsfContext {
  columnItems: SelectItemCategoryDefinition<string>[];
  columnNames: string[];
  currentName: string;
  dateColumnItems: SelectItemCategoryDefinition<string>[];
  numberColumnItems: SelectItemCategoryDefinition<string>[];
  stringColumnItems: SelectItemCategoryDefinition<string>[];
}

export const ColumnFormVjsfContextPropertyNames =
  getPropertyNames<Pick<VjsfOptions<ColumnFormVjsfContext>, "context">>();
