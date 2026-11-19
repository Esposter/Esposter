import type { Row } from "#shared/models/resource/sheet/datasource/Row";
import type { ToData } from "@esposter/shared";

export interface IndexedRow {
  index: number;
  row: ToData<Row>;
}
