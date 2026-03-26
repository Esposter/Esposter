import type { ItemEntityType } from "@esposter/shared";
import type { MathOperand } from "#shared/models/tableEditor/file/column/transformation/MathOperand";

import { createItemEntityTypeSchema } from "@esposter/shared";
import { BinaryMathOperationType } from "#shared/models/tableEditor/file/column/transformation/BinaryMathOperationType";
import { MathStepType } from "#shared/models/tableEditor/file/column/transformation/MathStepType";
import { mathOperandSchema } from "#shared/models/tableEditor/file/column/transformation/MathOperand";
import { z } from "zod";

export interface BinaryMathStep extends ItemEntityType<MathStepType.Binary> {
  operand: MathOperand;
  operation: BinaryMathOperationType;
}

export const binaryMathStepSchema = z
  .object({
    ...createItemEntityTypeSchema(z.literal(MathStepType.Binary).readonly()).shape,
    operand: mathOperandSchema,
    operation: z.enum(BinaryMathOperationType).meta({ title: "Operation" }),
  })
  .meta({ title: MathStepType.Binary }) satisfies z.ZodType<BinaryMathStep>;
