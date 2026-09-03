import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
import type { ColumnFormVjsfContext } from "@/models/resource/sheet/column/ColumnFormVjsfContext";
import type { VjsfOptions } from "@/models/vjsf/VjsfOptions";
import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { uniqueColumnNameKeywordDefinition } from "@/services/ajv/keywords/uniqueColumnNameKeywordDefinition";

const mapColumnToSelectItemCategoryDefinition = ({ id, name }: Column): SelectItemCategoryDefinition<Column["id"]> => ({
  title: name,
  value: id,
});

export const useColumnFormOptions = (
  dataSource: MaybeRefOrGetter<DataSource>,
  currentName: MaybeRefOrGetter<string>,
) => {
  const uniqueColumnNameKeywordDefinitionValidation = useUniqueColumnNameKeywordDefinitionValidation(
    () => toValue(dataSource).columns.map(({ name }) => name),
    currentName,
  );
  return computed<VjsfOptions<ColumnFormVjsfContext>>(() => {
    const columnItems: SelectItemCategoryDefinition<Column["id"]>[] = [];
    const columnTypeItemsMap: Partial<Record<ColumnType, SelectItemCategoryDefinition<Column["id"]>[]>> = {};
    for (const column of toValue(dataSource).columns) {
      const item = mapColumnToSelectItemCategoryDefinition(column);
      columnItems.push(item);
      (columnTypeItemsMap[column.type] ??= []).push(item);
    }
    return {
      ajvOptions: {
        keywords: [
          {
            ...uniqueColumnNameKeywordDefinition,
            validate: uniqueColumnNameKeywordDefinitionValidation,
          },
        ],
      },
      context: {
        columnItems,
        dateColumnItems: columnTypeItemsMap[ColumnType.Date] ?? [],
        numberColumnItems: columnTypeItemsMap[ColumnType.Number] ?? [],
        stringColumnItems: columnTypeItemsMap[ColumnType.String] ?? [],
      },
    };
  });
};
