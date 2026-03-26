import type { ColumnValue } from "#shared/models/tableEditor/file/column/ColumnValue";
import type { ColumnTransformation } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformation";
import type { MathOperand } from "#shared/models/tableEditor/file/column/transformation/MathOperationTransformation";
import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";

import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
import { MathOperandType } from "#shared/models/tableEditor/file/column/transformation/MathOperandType";
import { computeConvertToTransformation } from "@/services/tableEditor/file/column/transformation/computeConvertToTransformation";
import { computeDatePartTransformation } from "@/services/tableEditor/file/column/transformation/computeDatePartTransformation";
import { computeMathOperationTransformation } from "@/services/tableEditor/file/column/transformation/computeMathOperationTransformation";
import { computeRegexMatchTransformation } from "@/services/tableEditor/file/column/transformation/computeRegexMatchTransformation";
import { computeStringPatternTransformation } from "@/services/tableEditor/file/column/transformation/computeStringPatternTransformation";

export interface ResolveContext {
  findSource: (sourceColumnId: string) => DataSource["columns"][number] | undefined;
  resolveSource: (sourceColumnId: string) => ColumnValue;
}

type TransformationResolver<T extends ColumnTransformation> = (
  transformation: T,
  context: ResolveContext,
) => ColumnValue;

export const ColumnTransformationResolveMap = {
  [ColumnTransformationType.ConvertTo]: (transformation, { resolveSource }) =>
    computeConvertToTransformation(resolveSource(transformation.sourceColumnId), transformation),
  [ColumnTransformationType.DatePart]: (transformation, { resolveSource, findSource }) => {
    const sourceColumn = findSource(transformation.sourceColumnId);
    if (sourceColumn?.type !== ColumnType.Date) return null;
    return computeDatePartTransformation(
      resolveSource(transformation.sourceColumnId),
      transformation,
      sourceColumn.format,
    );
  },
  [ColumnTransformationType.MathOperation]: (transformation, { resolveSource }) => {
    const resolveOperand = (operand: MathOperand): ColumnValue =>
      operand.type === MathOperandType.Constant ? operand.value : resolveSource(operand.sourceColumnId);
    return computeMathOperationTransformation(transformation, resolveOperand);
  },
  [ColumnTransformationType.RegexMatch]: (transformation, { resolveSource }) =>
    computeRegexMatchTransformation(resolveSource(transformation.sourceColumnId), transformation),
  [ColumnTransformationType.StringPattern]: (transformation, { resolveSource }) => {
    const values = transformation.sourceColumnIds.map(resolveSource);
    return computeStringPatternTransformation(values, transformation.pattern);
  },
} as const satisfies {
  [K in ColumnTransformationType]: TransformationResolver<Extract<ColumnTransformation, { type: K }>>;
};
