import type { ItemEntityType } from "@esposter/shared";

import { createItemEntityTypeSchema } from "@esposter/shared";
import { MathOperandType } from "#shared/models/tableEditor/file/column/transformation/MathOperandType";
import { z } from "zod";

export interface ColumnMathOperand extends ItemEntityType<MathOperandType.Column> {
  sourceColumnId: string;
}

export const columnMathOperandSchema = z
  .object({
    ...createItemEntityTypeSchema(z.literal(MathOperandType.Column).readonly()).shape,
    sourceColumnId: z.string().meta({
      comp: "select",
      getItems: "context.numberSourceColumnItems",
      title: "Column",
    }),
  })
  .meta({ title: MathOperandType.Column }) satisfies z.ZodType<ColumnMathOperand>;
