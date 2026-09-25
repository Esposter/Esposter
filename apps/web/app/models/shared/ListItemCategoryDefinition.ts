import type { SelectItemCategoryDefinition } from "@/models/shared/SelectItemCategoryDefinition";

export interface ListItemCategoryDefinition<T> extends SelectItemCategoryDefinition<T> {
  icon: string;
}
