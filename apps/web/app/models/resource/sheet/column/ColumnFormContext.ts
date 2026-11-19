import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { UiSelectItem } from "#src/models/ui/UiSelectItem";
import type { ToData } from "@esposter/shared";

import { getPropertyNames } from "@esposter/shared";

// The columns a column's form picks among, every one and then only those of the type a transformation reads, which
// A field names by its key
export interface ColumnFormContext {
  columnItems: UiSelectItem<ToData<Column>["id"]>[];
  dateColumnItems: UiSelectItem<ToData<Column>["id"]>[];
  numberColumnItems: UiSelectItem<ToData<Column>["id"]>[];
  stringColumnItems: UiSelectItem<ToData<Column>["id"]>[];
}

export const ColumnFormContextPropertyNames = getPropertyNames<ColumnFormContext>();
