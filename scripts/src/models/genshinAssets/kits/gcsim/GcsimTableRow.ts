// A row of a module-scope Go table: the line its row starts on (1-based) and its cells as source text
export interface GcsimTableRow {
  cells: string[];
  line: number;
}
