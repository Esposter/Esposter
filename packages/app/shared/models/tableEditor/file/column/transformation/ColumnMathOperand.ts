import { MathOperandType } from "#shared/models/tableEditor/file/column/transformation/MathOperandType";
import { z } from "zod";

export interface ColumnMathOperand {
  sourceColumnId: string;
  readonly type: MathOperandType.Column;
}

export const columnMathOperandSchema = z
  .object({
    sourceColumnId: z.string().meta({
      comp: "select",
      getItems: "context.numberSourceColumnItems",
      title: "Column",
    }),
    type: z.literal(MathOperandType.Column).readonly(),
  })
  .meta({ title: MathOperandType.Column }) satisfies z.ZodType<ColumnMathOperand>;
