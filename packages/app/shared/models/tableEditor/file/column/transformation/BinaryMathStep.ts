import { BinaryMathOperationType } from "#shared/models/tableEditor/file/column/transformation/BinaryMathOperationType";
import { MathStepType } from "#shared/models/tableEditor/file/column/transformation/MathStepType";
import { mathOperandSchema } from "#shared/models/tableEditor/file/column/transformation/MathOperand";
import { z } from "zod";

export const binaryMathStepSchema = z
  .object({
    operand: mathOperandSchema,
    operation: z.enum(BinaryMathOperationType).meta({ title: "Operation" }),
    type: z.literal(MathStepType.Binary).readonly(),
  })
  .meta({ title: MathStepType.Binary });

export type BinaryMathStep = z.infer<typeof binaryMathStepSchema>;
