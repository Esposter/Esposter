import type { Row } from "#shared/models/tableEditor/file/datasource/Row";
import type { ColumnFilter } from "@/models/tableEditor/file/column/ColumnFilter";

import { BooleanValue } from "#shared/models/tableEditor/file/column/BooleanValue";
import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { isActiveColumnFilter } from "@/services/tableEditor/file/column/isActiveColumnFilter";
import { takeOne } from "@esposter/shared";

export const filterDataSourceRows = (rows: Row[], columnFilters: Record<string, ColumnFilter>): Row[] => {
  const activeFilters = Object.entries(columnFilters).filter(([, filter]) => isActiveColumnFilter(filter));
  if (activeFilters.length === 0) return rows;
  return rows.filter((row) =>
    activeFilters.every(([columnName, filter]) => {
      const cellValue = takeOne(row.data, columnName);
      if (filter.type === ColumnType.Boolean) {
        if (filter.value === "null") return cellValue === null;
        if (filter.value === BooleanValue.True) return cellValue === true;
        if (filter.value === BooleanValue.False) return cellValue === false;
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
};
