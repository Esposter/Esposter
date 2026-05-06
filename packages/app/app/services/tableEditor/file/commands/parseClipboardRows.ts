import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";

import { Row } from "#shared/models/tableEditor/file/datasource/Row";
import { coerceValue } from "@/services/tableEditor/file/column/coerceValue";
import { ID_SEPARATOR, normalizeString, takeOne } from "@esposter/shared";

const parseMarkdownRow = (line: string): string[] =>
  line
    .slice(2, -2)
    .split(` ${ID_SEPARATOR} `)
    .map((cell) => cell.replaceAll(`\\${ID_SEPARATOR}`, ID_SEPARATOR));

const isSeparatorRow = (cells: string[]): boolean => cells.every((cell) => /^:?-+:?$/u.test(cell));

export const parseClipboardRows = (text: string, dataSource: DataSource): Row[] => {
  const allRows = text
    .split(new RegExp(String.raw`\r?\n`, "u"))
    .filter((line) => normalizeString(line) !== "")
    .map((line) => parseMarkdownRow(line));
  const dataRows = allRows.filter((cells) => !isSeparatorRow(cells));
  if (dataRows.length < 2) return [];
  const headers = takeOne(dataRows);
  return dataRows.slice(1).map((cells) => {
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
