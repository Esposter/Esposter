import { MathOperandType } from "#shared/models/tableEditor/file/column/transformation/MathOperandType";
import { z } from "zod";

export const columnMathOperandSchema = z
  .object({
    sourceColumnId: z.string().meta({
      comp: "select",
      getItems: "context.numberSourceColumnItems",
      title: "Column",
    }),
    type: z.literal(MathOperandType.Column).readonly(),
  })
  .meta({ title: MathOperandType.Column });

export type ColumnMathOperand = z.infer<typeof columnMathOperandSchema>;
