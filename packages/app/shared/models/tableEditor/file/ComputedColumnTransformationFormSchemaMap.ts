import type { z } from "zod";

import {
  convertToTransformationFormSchema,
  datePartTransformationFormSchema,
  extractPatternTransformationFormSchema,
  mathOperationTransformationFormSchema,
} from "#shared/models/tableEditor/file/ColumnTransformation";
import { ColumnTransformationType } from "#shared/models/tableEditor/file/ColumnTransformationType";

export const ComputedColumnTransformationFormSchemaMap = {
  [ColumnTransformationType.ConvertTo]: convertToTransformationFormSchema,
  [ColumnTransformationType.DatePart]: datePartTransformationFormSchema,
  [ColumnTransformationType.ExtractPattern]: extractPatternTransformationFormSchema,
  [ColumnTransformationType.MathOperation]: mathOperationTransformationFormSchema,
} as const satisfies Record<ColumnTransformationType, z.ZodType>;
