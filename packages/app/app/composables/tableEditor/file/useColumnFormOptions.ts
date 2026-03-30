import type { Column } from "#shared/models/tableEditor/file/column/Column";
import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";
import type { ColumnFormVjsfContext } from "@/models/tableEditor/file/column/ColumnFormVjsfContext";
import type { VjsfOptions } from "@/models/vjsf/VjsfOptions";
import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";
import type { MaybeRefOrGetter } from "vue";

import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { ajvOptions } from "@/services/ajv/ajvOptions";
import { setColumnNameValidationStateGetter } from "@/services/ajv/keywords/uniqueColumnName";

const mapColumnToSelectItemCategoryDefinition = ({ id, name }: Column): SelectItemCategoryDefinition<Column["id"]> => ({
  title: name,
  value: id,
});

export const useColumnFormOptions = (
  dataSource: MaybeRefOrGetter<DataSource>,
  currentName: MaybeRefOrGetter<string>,
) => {
  setColumnNameValidationStateGetter(() => ({
    columnNames: toValue(dataSource).columns.map(({ name }) => name),
    currentName: toValue(currentName),
  }));
  return computed<VjsfOptions<ColumnFormVjsfContext>>(() => {
    const dataSourceValue = toValue(dataSource);
    const currentNameValue = toValue(currentName);
    return {
      ajvOptions,
      context: {
        booleanColumnItems: dataSourceValue.columns
          .filter(({ type }) => type === ColumnType.Boolean)
          .map((column) => mapColumnToSelectItemCategoryDefinition(column)),
        columnItems: dataSourceValue.columns.map(mapColumnToSelectItemCategoryDefinition),
        columnNames: dataSourceValue.columns.map(({ name }) => name),
        computedColumnItems: dataSourceValue.columns
          .filter(({ type }) => type === ColumnType.Computed)
          .map((column) => mapColumnToSelectItemCategoryDefinition(column)),
        currentName: currentNameValue,
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
