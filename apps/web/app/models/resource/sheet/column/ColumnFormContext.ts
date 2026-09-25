import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { UiSelectItem } from "@/models/ui/UiSelectItem";

import { getPropertyNames } from "@esposter/shared";

// The columns a column's form picks among, every one and then only those of the type a transformation reads, which
// A field names by its key
export interface ColumnFormContext {
  columnItems: UiSelectItem<Column["id"]>[];
  dateColumnItems: UiSelectItem<Column["id"]>[];
  numberColumnItems: UiSelectItem<Column["id"]>[];
  stringColumnItems: UiSelectItem<Column["id"]>[];
}

export const ColumnFormContextPropertyNames = getPropertyNames<ColumnFormContext>();
