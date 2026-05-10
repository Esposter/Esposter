import type { Column } from "#shared/models/tableEditor/file/column/Column";
import type { Row } from "#shared/models/tableEditor/file/datasource/Row";
import type { CellRange } from "@/models/tableEditor/file/CellRange";

export interface CopiedRange {
  columns: Column[];
  includeHeaders: boolean;
  rows: Row[];
}

export class CopyRangeCommand {
  private readonly displayColumns: Column[];
  private readonly includeHeaders: boolean;
  private readonly range: CellRange;
  private readonly rows: Row[];

  constructor(range: CellRange, displayColumns: Column[], rows: Row[], includeHeaders: boolean) {
    this.displayColumns = displayColumns;
    this.includeHeaders = includeHeaders;
    this.range = range;
    this.rows = rows;
  }

  execute(): CopiedRange {
    return {
      columns: this.displayColumns.slice(this.range.columnStart, this.range.columnEnd + 1),
      includeHeaders: this.includeHeaders,
      rows: this.rows.slice(this.range.rowStart, this.range.rowEnd + 1),
    };
  }
}
