import type { SelectItemCategoryDefinition } from "#src/models/shared/SelectItemCategoryDefinition";

export interface ListItemCategoryDefinition<T> extends SelectItemCategoryDefinition<T> {
  icon: string;
}
