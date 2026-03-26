import type { MathOperand } from "#shared/models/tableEditor/file/column/transformation/MathOperand";
import type { MathStep } from "#shared/models/tableEditor/file/column/transformation/MathStep";
import type { ItemEntityType } from "@esposter/shared";

import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
import { mathOperandSchema } from "#shared/models/tableEditor/file/column/transformation/MathOperand";
import { mathStepSchema } from "#shared/models/tableEditor/file/column/transformation/MathStep";
import { createItemEntityTypeSchema } from "@esposter/shared";
import { z } from "zod";

export interface MathOperationTransformation extends ItemEntityType<ColumnTransformationType.MathOperation> {
  first: MathOperand;
  steps: MathStep[];
}

export const mathOperationTransformationSchema = z
  .object({
    ...createItemEntityTypeSchema(z.literal(ColumnTransformationType.MathOperation).readonly()).shape,
    first: mathOperandSchema.meta({ title: "First" }),
    steps: z.array(mathStepSchema).default([]).meta({ title: "Steps" }),
  })
  .meta({ title: ColumnTransformationType.MathOperation }) satisfies z.ZodType<MathOperationTransformation>;
