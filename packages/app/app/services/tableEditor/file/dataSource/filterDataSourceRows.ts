import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";
import type { ColumnFilter } from "@/models/tableEditor/file/column/ColumnFilter";

import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { isActiveColumnFilter } from "@/services/tableEditor/file/column/isActiveColumnFilter";
import { takeOne } from "@esposter/shared";

export const filterDataSourceRows = (
  dataSource: DataSource,
  columnFilters: Record<string, ColumnFilter>,
): DataSource => {
  const activeFilters = Object.entries(columnFilters).filter(([, filter]) => isActiveColumnFilter(filter));
  if (activeFilters.length === 0) return dataSource;
  const rows = dataSource.rows.filter((row) =>
    activeFilters.every(([columnName, filter]) => {
      const cellValue = takeOne(row.data, columnName);
      if (filter.type === ColumnType.Boolean) {
        if (filter.value === "null") return cellValue === null;
        if (filter.value === "true") return cellValue === true;
        if (filter.value === "false") return cellValue === false;
        return true;
      }
      if (filter.type === ColumnType.Number) {
        if (cellValue === null) return false;
        const numValue = Number(cellValue);
        if (Number.isNaN(numValue)) return false;
        if (filter.minimum !== "" && numValue < Number(filter.minimum)) return false;
        if (filter.maximum !== "" && numValue > Number(filter.maximum)) return false;
        return true;
      }
      return cellValue !== null && String(cellValue).toLowerCase().includes(filter.value.toLowerCase());
    }),
  );
  return { ...dataSource, rows };
};
