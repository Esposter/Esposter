import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
import type { ColumnFormContext } from "@/models/resource/sheet/column/ColumnFormContext";
import type { UiSelectItem } from "@/models/ui/UiSelectItem";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { columnFormSchema } from "@/models/resource/sheet/column/ColumnForm";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

// What the create and edit column dialogs share: the columns a transformation picks among, every one and by type, and
// The form schema refined so a name another column already has is refused, the column's own current name aside
export const useColumnForm = (dataSource: MaybeRefOrGetter<DataSource>, currentName: MaybeRefOrGetter<string>) => {
  const context = computed<ColumnFormContext>(() => {
    const columnItems: UiSelectItem<Column["id"]>[] = [];
    const columnTypeItemsMap: Partial<Record<ColumnType, UiSelectItem<Column["id"]>[]>> = {};
    for (const { id, name, type } of toValue(dataSource).columns) {
      const item: UiSelectItem<Column["id"]> = { meaning: UiIconMeaning.Columns, title: name, value: id };
      columnItems.push(item);
      (columnTypeItemsMap[type] ??= []).push(item);
    }
    return {
      columnItems,
      dateColumnItems: columnTypeItemsMap[ColumnType.Date] ?? [],
      numberColumnItems: columnTypeItemsMap[ColumnType.Number] ?? [],
      stringColumnItems: columnTypeItemsMap[ColumnType.String] ?? [],
    };
  });
  const schema = computed(() =>
    columnFormSchema.superRefine(({ name }, refinementContext) => {
      if (name === toValue(currentName) || !toValue(dataSource).columns.some((column) => column.name === name)) return;
      refinementContext.addIssue({ code: "custom", message: "Column already exists", path: ["name"] });
    }),
  );
  return { context, schema };
};
