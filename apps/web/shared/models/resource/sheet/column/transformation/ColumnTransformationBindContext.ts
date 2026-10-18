import type { ColumnCellReader } from "#shared/models/resource/sheet/column/ColumnCellReader";
import type { Row } from "#shared/models/resource/sheet/datasource/Row";
import type { ToData } from "@esposter/shared";

export interface ColumnTransformationBindContext {
  readSource: (sourceColumnId: string) => ColumnCellReader;
  rows: ToData<Row>[];
}
