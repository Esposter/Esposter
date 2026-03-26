import type { MathOperand } from "#shared/models/tableEditor/file/column/transformation/MathOperand";
import type { ItemEntityType } from "@esposter/shared";

import {
  BinaryMathOperationType,
  binaryMathOperationTypeSchema,
} from "#shared/models/tableEditor/file/column/transformation/BinaryMathOperationType";
import { mathOperandSchema } from "#shared/models/tableEditor/file/column/transformation/MathOperand";
import { MathStepType } from "#shared/models/tableEditor/file/column/transformation/MathStepType";
import { createItemEntityTypeSchema } from "@esposter/shared";
import { z } from "zod";

export interface BinaryMathStep extends ItemEntityType<MathStepType.Binary> {
  operand: MathOperand;
  operation: BinaryMathOperationType;
}

export const binaryMathStepSchema = z
  .object({
    ...createItemEntityTypeSchema(z.literal(MathStepType.Binary).readonly()).shape,
    operand: mathOperandSchema,
    operation: binaryMathOperationTypeSchema,
  })
  .meta({ title: MathStepType.Binary }) satisfies z.ZodType<BinaryMathStep>;
