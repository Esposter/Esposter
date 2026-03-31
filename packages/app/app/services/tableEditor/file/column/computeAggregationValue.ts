import type { Column } from "#shared/models/tableEditor/file/column/Column";
import type { ColumnValue } from "#shared/models/tableEditor/file/column/ColumnValue";
import type { AggregationTransformation } from "#shared/models/tableEditor/file/column/transformation/AggregationTransformation";
import type { Row } from "#shared/models/tableEditor/file/datasource/Row";

import { AggregationTransformationComputeMap } from "@/services/tableEditor/file/column/transformation/AggregationTransformationComputeMap";
import { takeOne } from "@esposter/shared";

export const computeAggregationValue = (
  rows: Row[],
  findSource: (sourceColumnId: string) => Column | undefined,
  transformation: AggregationTransformation,
  rowIndex: number,
): ColumnValue => {
  const sourceColumn = findSource(transformation.sourceColumnId);
  if (!sourceColumn) return null;

  const getNumber = (row: Row): null | number => {
    const value = takeOne(row.data, sourceColumn.name);
    return typeof value === "number" ? value : null;
  };
  const nonNullValues = rows.map((row) => getNumber(row)).filter((value) => value !== null);
  return AggregationTransformationComputeMap[transformation.aggregationTransformationType]({
    getNumber,
    nonNullValues,
    rowIndex,
    rows,
  });
};
