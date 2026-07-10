import type { ColumnValue } from "#shared/models/resource/file/column/ColumnValue";
import type { ColumnTransformation } from "#shared/models/resource/file/column/transformation/ColumnTransformation";
import type { ColumnTransformationComputeContext } from "@/models/resource/file/column/transformation/ColumnTransformationComputeContext";

import { ColumnType } from "#shared/models/resource/file/column/ColumnType";
import { ColumnTransformationType } from "#shared/models/resource/file/column/transformation/ColumnTransformationType";
import { computeAggregationValue } from "@/services/resource/file/column/computeAggregationValue";
import { computeConvertToTransformation } from "@/services/resource/file/column/transformation/computeConvertToTransformation";
import { computeDatePartTransformation } from "@/services/resource/file/column/transformation/computeDatePartTransformation";
import { computeMathTransformation } from "@/services/resource/file/column/transformation/computeMathTransformation";
import { computeRegexMatchTransformation } from "@/services/resource/file/column/transformation/computeRegexMatchTransformation";
import { computeSplitTransformation } from "@/services/resource/file/column/transformation/string/computeSplitTransformation";
import { computeStringPatternTransformation } from "@/services/resource/file/column/transformation/string/computeStringPatternTransformation";
import { computeStringTransformation } from "@/services/resource/file/column/transformation/string/computeStringTransformation";

type TransformationComputer<T extends ColumnTransformation> = (
  transformation: T,
  context: ColumnTransformationComputeContext,
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
  [ColumnTransformationType.StringSplit]: (transformation, { computeSource }) => {
    const value = computeSource(transformation.sourceColumnId);
    if (value === null) return null;
    return computeSplitTransformation(String(value), transformation.delimiter, transformation.segmentIndex);
  },
} as const satisfies {
  [K in ColumnTransformationType]: TransformationComputer<Extract<ColumnTransformation, { type: K }>>;
};
