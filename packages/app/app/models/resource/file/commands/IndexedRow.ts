import type { Row } from "#shared/models/resource/file/datasource/Row";

export interface IndexedRow {
  index: number;
  row: Row;
}
