import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";
import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
import type { AffectedCell } from "@/models/resource/sheet/commands/AffectedCell";

import { getVisibleColumns } from "@/services/resource/sheet/column/getVisibleColumns";
import { collectAffectedCells } from "@/services/resource/sheet/commands/collectAffectedCells";

export const findMatchingCells = (
  dataSource: DataSource,
  findValue: string,
  specificCell?: { columnName: string; rowIndex: number },
): AffectedCell[] => {
  const checkIsMatch = (value: ColumnValue): boolean => value !== null && String(value).includes(findValue);
  const visibleColumns = getVisibleColumns(dataSource.columns);
  if (!specificCell) return collectAffectedCells(dataSource.rows, visibleColumns, checkIsMatch);

  const specificColumn = visibleColumns.find((column) => column.name === specificCell.columnName);
  if (!specificColumn) return [];
  return collectAffectedCells(dataSource.rows, [specificColumn], checkIsMatch, {
    end: specificCell.rowIndex,
    start: specificCell.rowIndex,
  });
};
