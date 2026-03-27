import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";

export interface ColumnFormVjsfContext {
  columnItems: SelectItemCategoryDefinition<string>[];
  columnNames: string[];
  currentName: string;
  dateColumnItems: SelectItemCategoryDefinition<string>[];
  numberColumnItems: SelectItemCategoryDefinition<string>[];
  stringColumnItems: SelectItemCategoryDefinition<string>[];
}
