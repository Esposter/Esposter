import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";

export interface ListItemCategoryDefinition<T> extends SelectItemCategoryDefinition<T> {
  icon: string;
}
