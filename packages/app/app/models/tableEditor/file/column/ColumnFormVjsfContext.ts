import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";

export interface ColumnFormVjsfContext {
  columnNames: string[];
  currentName: string;
  dateSourceColumnItems: SelectItemCategoryDefinition<string>[];
  numberSourceColumnItems: SelectItemCategoryDefinition<string>[];
  sourceColumnItems: SelectItemCategoryDefinition<string>[];
  stringSourceColumnItems: SelectItemCategoryDefinition<string>[];
}
