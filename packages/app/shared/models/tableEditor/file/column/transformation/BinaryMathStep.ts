import type { MathOperand } from "#shared/models/tableEditor/file/column/transformation/MathOperand";

import { BinaryMathOperationType } from "#shared/models/tableEditor/file/column/transformation/BinaryMathOperationType";
import { MathStepType } from "#shared/models/tableEditor/file/column/transformation/MathStepType";
import { mathOperandSchema } from "#shared/models/tableEditor/file/column/transformation/MathOperand";
import { z } from "zod";

export interface BinaryMathStep {
  operand: MathOperand;
  operation: BinaryMathOperationType;
  readonly type: MathStepType.Binary;
}

export const binaryMathStepSchema = z
  .object({
    operand: mathOperandSchema,
    operation: z.enum(BinaryMathOperationType).meta({ title: "Operation" }),
    type: z.literal(MathStepType.Binary).readonly(),
  })
  .meta({ title: MathStepType.Binary }) satisfies z.ZodType<BinaryMathStep>;
