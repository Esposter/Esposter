import type { Column } from "#shared/models/tableEditor/file/column/Column";
import type { ColumnValue } from "#shared/models/tableEditor/file/column/ColumnValue";
import type { Row } from "#shared/models/tableEditor/file/datasource/Row";

export interface ColumnTransformationComputeContext {
  computeSource: (sourceColumnId: string) => ColumnValue;
  findSource: (sourceColumnId: string) => Column | undefined;
  rowIndex?: number;
  rows?: Row[];
}
