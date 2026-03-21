import type { DataSource } from "#shared/models/tableEditor/file/DataSource";

import { Row } from "#shared/models/tableEditor/file/Row";
import { coerceValue } from "@/services/tableEditor/file/column/coerceValue";
import { takeOne } from "@esposter/shared";

const parseMarkdownRow = (line: string): string[] =>
  line
    .split("|")
    .slice(1, -1)
    .map((cell) => cell.trim().replaceAll(String.raw`\|`, "|"));

const isSeparatorRow = (cells: string[]): boolean => cells.every((cell) => /^:?-+:?$/.test(cell));

export const parseClipboardRows = (text: string, dataSource: DataSource): DataSource["rows"] => {
  const allRows = text
    .split(/\r?\n/)
    .filter((line) => line.trim() !== "")
    .map((line) => parseMarkdownRow(line));
  const dataRows = allRows.filter((cells) => !isSeparatorRow(cells));
  if (dataRows.length < 2) return [];
  const headers = takeOne(dataRows, 0);
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
