import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";
import type { ColumnFormVjsfContext } from "@/models/tableEditor/file/column/ColumnFormVjsfContext";
import type { VjsfOptions } from "@/models/vjsf/VjsfOptions";
import type { MaybeRefOrGetter } from "vue";

import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";

export const useColumnFormOptions = (dataSource: MaybeRefOrGetter<DataSource>, currentName: MaybeRefOrGetter<string>) =>
  computed<VjsfOptions<ColumnFormVjsfContext>>(() => {
    const dataSourceValue = toValue(dataSource);
    const currentNameValue = toValue(currentName);
    return {
      context: {
        columnNames: dataSourceValue.columns.map(({ name }) => name),
        currentName: currentNameValue,
        dateSourceColumnItems: dataSourceValue.columns
          .filter(({ type }) => type === ColumnType.Date)
          .map(({ id, name }) => ({ title: name, value: id })),
        numberSourceColumnItems: dataSourceValue.columns
          .filter(({ type }) => type === ColumnType.Number)
          .map(({ id, name }) => ({ title: name, value: id })),
        sourceColumnItems: dataSourceValue.columns.map(({ id, name }) => ({ title: name, value: id })),
        stringSourceColumnItems: dataSourceValue.columns
          .filter(({ type }) => type === ColumnType.String)
          .map(({ id, name }) => ({ title: name, value: id })),
      },
    };
  });
