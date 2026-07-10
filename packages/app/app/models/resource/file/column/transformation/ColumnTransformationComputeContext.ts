import type { Column } from "#shared/models/resource/file/column/Column";
import type { ColumnValue } from "#shared/models/resource/file/column/ColumnValue";
import type { Row } from "#shared/models/resource/file/datasource/Row";

export interface ColumnTransformationComputeContext {
  computeSource: (sourceColumnId: string) => ColumnValue;
  findSource: (sourceColumnId: string) => Column | undefined;
  rowIndex?: number;
  rows?: Row[];
}
