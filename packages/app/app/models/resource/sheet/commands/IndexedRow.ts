import type { Row } from "#shared/models/resource/sheet/datasource/Row";

export interface IndexedRow {
  index: number;
  row: Row;
}
