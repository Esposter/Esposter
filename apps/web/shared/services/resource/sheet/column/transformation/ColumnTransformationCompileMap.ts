import type { ColumnTransformation } from "#shared/models/resource/sheet/column/transformation/ColumnTransformation";
import type { ColumnTransformationCompiler } from "#shared/models/resource/sheet/column/transformation/ColumnTransformationCompiler";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { ColumnTransformationType } from "#shared/models/resource/sheet/column/transformation/ColumnTransformationType";
import { compileAggregationTransformation } from "#shared/services/resource/sheet/column/transformation/compileAggregationTransformation";
import { compileMathTransformation } from "#shared/services/resource/sheet/column/transformation/compileMathTransformation";
import { compileRegexMatchTransformation } from "#shared/services/resource/sheet/column/transformation/compileRegexMatchTransformation";
import { computeConvertToTransformation } from "#shared/services/resource/sheet/column/transformation/computeConvertToTransformation";
import { computeDatePartTransformation } from "#shared/services/resource/sheet/column/transformation/computeDatePartTransformation";
import { computeSplitTransformation } from "#shared/services/resource/sheet/column/transformation/string/computeSplitTransformation";
import { computeStringPatternTransformation } from "#shared/services/resource/sheet/column/transformation/string/computeStringPatternTransformation";
import { computeStringTransformation } from "#shared/services/resource/sheet/column/transformation/string/computeStringTransformation";

export const ColumnTransformationCompileMap = {
  [ColumnTransformationType.Aggregation]: compileAggregationTransformation,
  [ColumnTransformationType.ConvertTo]:
    (transformation) =>
    ({ readSource }) => {
      const readValue = readSource(transformation.sourceColumnId);
      return (row, rowIndex) => computeConvertToTransformation(readValue(row, rowIndex), transformation);
    },
  [ColumnTransformationType.DatePart]: (transformation, findSource) => {
    const sourceColumn = findSource(transformation.sourceColumnId);
    if (sourceColumn?.type !== ColumnType.Date) return () => () => null;
    return ({ readSource }) => {
      const readValue = readSource(transformation.sourceColumnId);
      return (row, rowIndex) =>
        computeDatePartTransformation(readValue(row, rowIndex), transformation, sourceColumn.format);
    };
  },
  [ColumnTransformationType.Math]: compileMathTransformation,
  [ColumnTransformationType.RegexMatch]: compileRegexMatchTransformation,
  [ColumnTransformationType.String]:
    (transformation) =>
    ({ readSource }) => {
      const readValue = readSource(transformation.sourceColumnId);
      return (row, rowIndex) => {
        const value = readValue(row, rowIndex);
        if (value === null) return null;
        else return computeStringTransformation(String(value), transformation.stringTransformationType);
      };
    },
  [ColumnTransformationType.StringPattern]:
    (transformation) =>
    ({ readSource }) => {
      const readValues = transformation.sourceColumnIds.map((sourceColumnId) => readSource(sourceColumnId));
      return (row, rowIndex) =>
        computeStringPatternTransformation(
          readValues.map((readValue) => readValue(row, rowIndex)),
          transformation.pattern,
        );
    },
  [ColumnTransformationType.StringSplit]:
    (transformation) =>
    ({ readSource }) => {
      const readValue = readSource(transformation.sourceColumnId);
      return (row, rowIndex) => {
        const value = readValue(row, rowIndex);
        if (value === null) return null;
        else return computeSplitTransformation(String(value), transformation.delimiter, transformation.segmentIndex);
      };
    },
} as const satisfies {
  [K in ColumnTransformationType]: ColumnTransformationCompiler<Extract<ColumnTransformation, { type: K }>>;
};
