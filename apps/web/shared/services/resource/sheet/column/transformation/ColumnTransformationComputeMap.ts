import type { ColumnTransformation } from "#shared/models/resource/sheet/column/transformation/ColumnTransformation";
import type { ColumnTransformationComputer } from "#shared/models/resource/sheet/column/transformation/ColumnTransformationComputer";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { ColumnTransformationType } from "#shared/models/resource/sheet/column/transformation/ColumnTransformationType";
import { computeAggregationValue } from "#shared/services/resource/sheet/column/transformation/computeAggregationValue";
import { computeConvertToTransformation } from "#shared/services/resource/sheet/column/transformation/computeConvertToTransformation";
import { computeDatePartTransformation } from "#shared/services/resource/sheet/column/transformation/computeDatePartTransformation";
import { computeMathTransformation } from "#shared/services/resource/sheet/column/transformation/computeMathTransformation";
import { computeRegexMatchTransformation } from "#shared/services/resource/sheet/column/transformation/computeRegexMatchTransformation";
import { computeSplitTransformation } from "#shared/services/resource/sheet/column/transformation/string/computeSplitTransformation";
import { computeStringPatternTransformation } from "#shared/services/resource/sheet/column/transformation/string/computeStringPatternTransformation";
import { computeStringTransformation } from "#shared/services/resource/sheet/column/transformation/string/computeStringTransformation";

export const ColumnTransformationComputeMap = {
  [ColumnTransformationType.Aggregation]: (transformation, { findSource, rowIndex, rows, transformationReaderMap }) => {
    if (!rows || rowIndex === undefined) return null;
    else return computeAggregationValue(rows, findSource, transformation, rowIndex, transformationReaderMap);
  },
  [ColumnTransformationType.ConvertTo]: (transformation, { computeSource }) =>
    computeConvertToTransformation(computeSource(transformation.sourceColumnId), transformation),
  [ColumnTransformationType.DatePart]: (transformation, { computeSource, findSource }) => {
    const sourceColumn = findSource(transformation.sourceColumnId);
    if (sourceColumn?.type === ColumnType.Date)
      return computeDatePartTransformation(
        computeSource(transformation.sourceColumnId),
        transformation,
        sourceColumn.format,
      );
    else return null;
  },
  [ColumnTransformationType.Math]: (transformation, { computeSource }) =>
    computeMathTransformation(transformation, computeSource),
  [ColumnTransformationType.RegexMatch]: (transformation, { computeSource }) =>
    computeRegexMatchTransformation(computeSource(transformation.sourceColumnId), transformation),
  [ColumnTransformationType.String]: (transformation, { computeSource }) => {
    const value = computeSource(transformation.sourceColumnId);
    if (value === null) return null;
    else return computeStringTransformation(String(value), transformation.stringTransformationType);
  },
  [ColumnTransformationType.StringPattern]: (transformation, { computeSource }) => {
    const values = transformation.sourceColumnIds.map((sourceColumnId) => computeSource(sourceColumnId));
    return computeStringPatternTransformation(values, transformation.pattern);
  },
  [ColumnTransformationType.StringSplit]: (transformation, { computeSource }) => {
    const value = computeSource(transformation.sourceColumnId);
    if (value === null) return null;
    else return computeSplitTransformation(String(value), transformation.delimiter, transformation.segmentIndex);
  },
} as const satisfies {
  [K in ColumnTransformationType]: ColumnTransformationComputer<Extract<ColumnTransformation, { type: K }>>;
};
