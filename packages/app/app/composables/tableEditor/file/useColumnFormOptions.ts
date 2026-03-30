import type { Column } from "#shared/models/tableEditor/file/column/Column";
import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";
import type { ColumnFormVjsfContext } from "@/models/tableEditor/file/column/ColumnFormVjsfContext";
import type { VjsfOptions } from "@/models/vjsf/VjsfOptions";
import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";
import type { MaybeRefOrGetter } from "vue";

import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
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
    const dataSourceValue = toValue(dataSource);
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
        booleanColumnItems: dataSourceValue.columns
          .filter(({ type }) => type === ColumnType.Boolean)
          .map((column) => mapColumnToSelectItemCategoryDefinition(column)),
        columnItems: dataSourceValue.columns.map((column) => mapColumnToSelectItemCategoryDefinition(column)),
        computedColumnItems: dataSourceValue.columns
          .filter(({ type }) => type === ColumnType.Computed)
          .map((column) => mapColumnToSelectItemCategoryDefinition(column)),
        dateColumnItems: dataSourceValue.columns
          .filter(({ type }) => type === ColumnType.Date)
          .map((column) => mapColumnToSelectItemCategoryDefinition(column)),
        numberColumnItems: dataSourceValue.columns
          .filter(({ type }) => type === ColumnType.Number)
          .map((column) => mapColumnToSelectItemCategoryDefinition(column)),
        stringColumnItems: dataSourceValue.columns
          .filter(({ type }) => type === ColumnType.String)
          .map((column) => mapColumnToSelectItemCategoryDefinition(column)),
      },
    };
  });
};
