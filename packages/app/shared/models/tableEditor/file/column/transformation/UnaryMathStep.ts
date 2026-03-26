import type { ItemEntityType } from "@esposter/shared";

import { MathStepType } from "#shared/models/tableEditor/file/column/transformation/MathStepType";
import {
  UnaryMathOperationType,
  unaryMathOperationTypeSchema,
} from "#shared/models/tableEditor/file/column/transformation/UnaryMathOperationType";
import { createItemEntityTypeSchema } from "@esposter/shared";
import { z } from "zod";

export interface UnaryMathStep extends ItemEntityType<MathStepType.Unary> {
  operation: UnaryMathOperationType;
}

export const unaryMathStepSchema = z
  .object({
    ...createItemEntityTypeSchema(z.literal(MathStepType.Unary).readonly()).shape,
    operation: unaryMathOperationTypeSchema,
  })
  .meta({ title: MathStepType.Unary }) satisfies z.ZodType<UnaryMathStep>;
