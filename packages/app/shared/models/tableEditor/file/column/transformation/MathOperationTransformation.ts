import type { MathOperand } from "#shared/models/tableEditor/file/column/transformation/MathOperand";
import type { MathStep } from "#shared/models/tableEditor/file/column/transformation/MathStep";

import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
import { mathOperandSchema } from "#shared/models/tableEditor/file/column/transformation/MathOperand";
import { mathStepSchema } from "#shared/models/tableEditor/file/column/transformation/MathStep";
import { z } from "zod";

export interface MathOperationTransformation {
  first: MathOperand;
  steps: MathStep[];
  readonly type: ColumnTransformationType.MathOperation;
}

export const mathOperationTransformationSchema = z
  .object({
    first: mathOperandSchema.meta({ title: "First" }),
    steps: z.array(mathStepSchema).default([]).meta({ title: "Steps" }),
    type: z.literal(ColumnTransformationType.MathOperation).readonly(),
  })
  .meta({ title: ColumnTransformationType.MathOperation }) satisfies z.ZodType<MathOperationTransformation>;
