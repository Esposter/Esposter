import type { ItemEntityType } from "@esposter/shared";

import { MathOperandType } from "#shared/models/tableEditor/file/column/transformation/MathOperandType";
import { createItemEntityTypeSchema } from "@esposter/shared";
import { z } from "zod";

export interface ConstantMathOperand extends ItemEntityType<MathOperandType.Constant> {
  value: number;
}

export const constantMathOperandSchema = z
  .object({
    ...createItemEntityTypeSchema(z.literal(MathOperandType.Constant).readonly()).shape,
    value: z.number().meta({ title: "Value" }),
  })
  .meta({ title: MathOperandType.Constant }) satisfies z.ZodType<ConstantMathOperand>;
