import type { ColumnValue } from "#shared/models/tableEditor/file/column/ColumnValue";

import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
import { computeConvertToTransformation } from "@/services/tableEditor/file/column/transformation/computeConvertToTransformation";
import { computeDatePartTransformation } from "@/services/tableEditor/file/column/transformation/computeDatePartTransformation";
import { computeMathOperationTransformation } from "@/services/tableEditor/file/column/transformation/computeMathOperationTransformation";
import { computeRegexMatchTransformation } from "@/services/tableEditor/file/column/transformation/computeRegexMatchTransformation";

export const ColumnTransformationTypeComputeMap = {
  [ColumnTransformationType.ConvertTo]: { compute: computeConvertToTransformation },
  [ColumnTransformationType.DatePart]: { compute: computeDatePartTransformation },
  [ColumnTransformationType.MathOperation]: { compute: computeMathOperationTransformation },
  [ColumnTransformationType.RegexMatch]: { compute: computeRegexMatchTransformation },
} as const satisfies Record<
  ColumnTransformationType,
  { compute: (value: ColumnValue, transformation: never) => ColumnValue }
>;
