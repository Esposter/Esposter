import type { Column } from "#shared/models/tableEditor/file/column/Column";
import type { ColumnValue } from "#shared/models/tableEditor/file/column/ColumnValue";
import type { ColumnTransformation } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformation";
import type { Row } from "#shared/models/tableEditor/file/datasource/Row";

import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
import { computeAggregationValue } from "@/services/tableEditor/file/column/computeAggregationValue";
import { computeConvertToTransformation } from "@/services/tableEditor/file/column/transformation/computeConvertToTransformation";
import { computeDatePartTransformation } from "@/services/tableEditor/file/column/transformation/computeDatePartTransformation";
import { computeMathTransformation } from "@/services/tableEditor/file/column/transformation/computeMathTransformation";
import { computeRegexMatchTransformation } from "@/services/tableEditor/file/column/transformation/computeRegexMatchTransformation";
import { computeStringPatternTransformation } from "@/services/tableEditor/file/column/transformation/string/computeStringPatternTransformation";
import { computeStringTransformation } from "@/services/tableEditor/file/column/transformation/string/computeStringTransformation";

export interface ComputeContext {
  computeSource: (sourceColumnId: string) => ColumnValue;
  findSource: (sourceColumnId: string) => Column | undefined;
  rowIndex?: number;
  rows?: Row[];
}

type TransformationComputer<T extends ColumnTransformation> = (
  transformation: T,
  context: ComputeContext,
) => ColumnValue;

export const ColumnTransformationComputeMap = {
  [ColumnTransformationType.Aggregation]: (transformation, { findSource, rowIndex, rows }) => {
    if (!rows || rowIndex === undefined) return null;
    return computeAggregationValue(rows, findSource, transformation, rowIndex);
  },
  [ColumnTransformationType.ConvertTo]: (transformation, { computeSource }) =>
    computeConvertToTransformation(computeSource(transformation.sourceColumnId), transformation),
  [ColumnTransformationType.DatePart]: (transformation, { computeSource, findSource }) => {
    const sourceColumn = findSource(transformation.sourceColumnId);
    if (sourceColumn?.type !== ColumnType.Date) return null;
    return computeDatePartTransformation(
      computeSource(transformation.sourceColumnId),
      transformation,
      sourceColumn.format,
    );
  },
  [ColumnTransformationType.Math]: (transformation, { computeSource }) =>
    computeMathTransformation(transformation, computeSource),
  [ColumnTransformationType.RegexMatch]: (transformation, { computeSource }) =>
    computeRegexMatchTransformation(computeSource(transformation.sourceColumnId), transformation),
  [ColumnTransformationType.String]: (transformation, { computeSource }) => {
    const value = computeSource(transformation.sourceColumnId);
    if (value === null) return null;
    return computeStringTransformation(String(value), transformation.stringTransformationType);
  },
  [ColumnTransformationType.StringPattern]: (transformation, { computeSource }) => {
    const values = transformation.sourceColumnIds.map(computeSource);
    return computeStringPatternTransformation(values, transformation.pattern);
  },
} as const satisfies {
  [K in ColumnTransformationType]: TransformationComputer<Extract<ColumnTransformation, { type: K }>>;
};
