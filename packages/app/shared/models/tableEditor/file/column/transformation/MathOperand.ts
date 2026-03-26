import type { ColumnMathOperand } from "#shared/models/tableEditor/file/column/transformation/ColumnMathOperand";
import type { ConstantMathOperand } from "#shared/models/tableEditor/file/column/transformation/ConstantMathOperand";

import { columnMathOperandSchema } from "#shared/models/tableEditor/file/column/transformation/ColumnMathOperand";
import { constantMathOperandSchema } from "#shared/models/tableEditor/file/column/transformation/ConstantMathOperand";
import { z } from "zod";

export type MathOperand = ColumnMathOperand | ConstantMathOperand;

export const mathOperandSchema = z
  .discriminatedUnion("type", [columnMathOperandSchema, constantMathOperandSchema])
  .meta({ title: "Operand" }) satisfies z.ZodType<MathOperand>;
