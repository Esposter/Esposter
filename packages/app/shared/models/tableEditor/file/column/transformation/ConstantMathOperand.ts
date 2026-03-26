import { MathOperandType } from "#shared/models/tableEditor/file/column/transformation/MathOperandType";
import { z } from "zod";

export const constantMathOperandSchema = z
  .object({
    type: z.literal(MathOperandType.Constant).readonly(),
    value: z.number().meta({ title: "Value" }),
  })
  .meta({ title: MathOperandType.Constant });

export type ConstantMathOperand = z.infer<typeof constantMathOperandSchema>;
