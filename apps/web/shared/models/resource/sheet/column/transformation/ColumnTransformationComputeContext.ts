import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";
import type { AggregationTransformation } from "#shared/models/resource/sheet/column/transformation/AggregationTransformation";
import type { AggregationTransformationReader } from "#shared/models/resource/sheet/column/transformation/AggregationTransformationReader";
import type { Row } from "#shared/models/resource/sheet/datasource/Row";
import type { ToData } from "@esposter/shared";

export interface ColumnTransformationComputeContext {
  computeSource: (sourceColumnId: string) => ColumnValue;
  findSource: (sourceColumnId: string) => ToData<Column> | undefined;
  rowIndex?: number;
  rows?: ToData<Row>[];
  transformationReaderMap?: Map<AggregationTransformation, AggregationTransformationReader>;
}
