import type { z } from "zod";

import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
import { convertToTransformationSchema } from "#shared/models/tableEditor/file/column/transformation/ConvertToTransformation";
import { datePartTransformationSchema } from "#shared/models/tableEditor/file/column/transformation/DatePartTransformation";
import { mathOperationTransformationSchema } from "#shared/models/tableEditor/file/column/transformation/MathOperationTransformation";
import { regexMatchTransformationSchema } from "#shared/models/tableEditor/file/column/transformation/RegexMatchTransformation";

export const ColumnTransformationSchemaMap = {
  [ColumnTransformationType.ConvertTo]: convertToTransformationSchema.omit({ type: true }),
  [ColumnTransformationType.DatePart]: datePartTransformationSchema.omit({ type: true }),
  [ColumnTransformationType.MathOperation]: mathOperationTransformationSchema.omit({ type: true }),
  [ColumnTransformationType.RegexMatch]: regexMatchTransformationSchema.omit({ type: true }),
} as const satisfies Record<ColumnTransformationType, z.ZodType>;
