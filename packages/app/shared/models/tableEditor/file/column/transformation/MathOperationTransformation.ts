import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
import { mathOperandSchema } from "#shared/models/tableEditor/file/column/transformation/MathOperand";
import { mathStepSchema } from "#shared/models/tableEditor/file/column/transformation/MathStep";
import { z } from "zod";

export const mathOperationTransformationSchema = z
  .object({
    first: mathOperandSchema.meta({ title: "First" }),
    steps: z.array(mathStepSchema).default([]).meta({ title: "Steps" }),
    type: z.literal(ColumnTransformationType.MathOperation).readonly(),
  })
  .meta({ title: ColumnTransformationType.MathOperation });

export type MathOperationTransformation = z.infer<typeof mathOperationTransformationSchema>;
