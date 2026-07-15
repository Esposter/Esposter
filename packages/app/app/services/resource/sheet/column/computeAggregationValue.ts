import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";
import type { AggregationTransformation } from "#shared/models/resource/sheet/column/transformation/AggregationTransformation";
import type { Row } from "#shared/models/resource/sheet/datasource/Row";

import { AggregationTransformationComputeMap } from "@/services/resource/sheet/column/transformation/AggregationTransformationComputeMap";
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
