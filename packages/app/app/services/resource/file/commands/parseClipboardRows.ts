import type { DataSource } from "#shared/models/resource/file/datasource/DataSource";

import { Row } from "#shared/models/resource/file/datasource/Row";
import { coerceValue } from "@/services/resource/file/column/coerceValue";
import { normalizeString, takeOne } from "@esposter/shared";

export const parseClipboardRows = (text: string, dataSource: DataSource): Row[] => {
  const allRows = text
    .split(/\r?\n/u)
    .filter((line) => normalizeString(line) !== "")
    .map((line) => line.split("\t"));
  if (allRows.length < 2) return [];
  const headers = takeOne(allRows);
  return allRows.slice(1).map((cells) => {
    const valueByHeader = new Map(headers.map((header, index) => [header, cells[index] ?? ""]));
    return new Row({
      data: Object.fromEntries(
        dataSource.columns.map((column) => [
          column.name,
          coerceValue(valueByHeader.get(column.name) ?? "", column.type),
        ]),
      ),
    });
  });
};
