import type { z } from "zod";

import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
import { convertToTransformationFormSchema } from "#shared/models/tableEditor/file/column/transformation/ConvertToTransformation";
import { datePartTransformationFormSchema } from "#shared/models/tableEditor/file/column/transformation/DatePartTransformation";
import { mathOperationTransformationFormSchema } from "#shared/models/tableEditor/file/column/transformation/MathOperationTransformation";
import { regexMatchTransformationFormSchema } from "#shared/models/tableEditor/file/column/transformation/RegexMatchTransformation";

export const ComputedColumnTransformationFormSchemaMap = {
  [ColumnTransformationType.ConvertTo]: convertToTransformationFormSchema,
  [ColumnTransformationType.DatePart]: datePartTransformationFormSchema,
  [ColumnTransformationType.MathOperation]: mathOperationTransformationFormSchema,
  [ColumnTransformationType.RegexMatch]: regexMatchTransformationFormSchema,
} as const satisfies Record<ColumnTransformationType, z.ZodType>;
