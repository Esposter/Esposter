import type { CsvOptions } from "#shared/models/tableEditor/file/CsvOptions";
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { IParser } from "#shared/services/tableEditor/file/IParser";

import { CsvDelimiter } from "#shared/models/tableEditor/file/CsvDelimiter";
import { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";
import { inferColumnType } from "@/services/tableEditor/file/inferColumnType";
import { coerceValue } from "@/services/tableEditor/file/parsers/coerceValue";
import { parseCsvLine } from "@/services/tableEditor/file/parsers/parseCsvLine";
import { readFileAsText } from "@/utils/readFileAsText";
import { takeOne } from "@esposter/shared";

export class CsvParser implements IParser<CsvOptions> {
  async parse(file: File, options: CsvOptions = { delimiter: CsvDelimiter.Comma }): Promise<DataSource> {
    const text = await readFileAsText(file);
    const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");

    if (lines.length === 0)
      return {
        columns: [],
        metadata: {
          columnCount: 0,
          dataSourceType: DataSourceType.Csv,
          importedAt: new Date(),
          name: file.name,
          rowCount: 0,
          size: file.size,
        },
        rows: [],
      };

    const sourceFieldNames = parseCsvLine(takeOne(lines), options.delimiter);
    const rawRows = lines.slice(1).map((line) => parseCsvLine(line, options.delimiter));
    const columns = sourceFieldNames.map((sourceFieldName, index) => ({
      fieldName: sourceFieldName,
      sourceFieldName,
      type: inferColumnType(rawRows.map((row) => row[index] ?? "")),
    }));
    const rows = rawRows.map((rawRow) =>
      Object.fromEntries(columns.map((column, index) => [column.fieldName, coerceValue(rawRow[index] ?? "", column.type)])),
    );

    return {
      columns,
      metadata: {
        columnCount: columns.length,
        dataSourceType: DataSourceType.Csv,
        importedAt: new Date(),
        name: file.name,
        rowCount: rows.length,
        size: file.size,
      },
      rows,
    };
  }
}
