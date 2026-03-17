import type { DataSource } from "#shared/models/tableEditor/file/DataSource";

import { Row } from "#shared/models/tableEditor/file/Row";
import { deserializeCsvLine } from "@/services/tableEditor/file/csv/deserializeCsvLine";
import { coerceValue } from "@/services/tableEditor/file/column/coerceValue";
import { takeOne } from "@esposter/shared";

export const parseClipboardRows = (text: string, dataSource: DataSource): DataSource["rows"] => {
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");
  if (lines.length < 2) return [];
  const headers = deserializeCsvLine(takeOne(lines, 0), "\t");
  const columnByHeaderMap = new Map(dataSource.columns.map((column) => [column.name.toLowerCase(), column]));
  return lines.slice(1).map((line) => {
    const cells = deserializeCsvLine(line, "\t");
    const row = new Row();
    for (const column of dataSource.columns) row.data[column.name] = null;
    for (const [index, header] of headers.entries()) {
      const column = columnByHeaderMap.get(header.toLowerCase());
      if (!column) continue;
      row.data[column.name] = coerceValue(takeOne(cells, index) ?? "", column.type);
    }
    return row;
  });
};
