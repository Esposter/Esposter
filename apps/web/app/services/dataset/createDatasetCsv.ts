import type { Dataset } from "#shared/models/dataset/Dataset";
import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";

import { CsvDelimiter } from "#shared/models/resource/sheet/csv/CsvDelimiter";
import { escapeUntrustedCsvCell } from "@/services/resource/sheet/csv/escapeUntrustedCsvCell";

const toCellText = (value: ColumnValue | undefined): string =>
  value === null || value === undefined ? "" : String(value);

// A file prints each column's title where it has one. Every cell is neutralised as a formula, header included, since
// the rows can hold text an anonymous respondent typed and a spreadsheet opens the file as the owner
export const createDatasetCsv = ({ columns, rows }: Dataset): string => {
  const escapeCell = (text: string) => escapeUntrustedCsvCell(text, CsvDelimiter.Comma);
  const headerRow = columns.map(({ name, title }) => escapeCell(title ?? name)).join(CsvDelimiter.Comma);
  const dataRows = rows.map((row) =>
    columns.map(({ name }) => escapeCell(toCellText(row[name]))).join(CsvDelimiter.Comma),
  );
  return [headerRow, ...dataRows].join("\n");
};
