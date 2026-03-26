import { MathStepType } from "#shared/models/tableEditor/file/column/transformation/MathStepType";
import { UnaryMathOperationType } from "#shared/models/tableEditor/file/column/transformation/UnaryMathOperationType";
import { z } from "zod";

export interface UnaryMathStep {
  operation: UnaryMathOperationType;
  readonly type: MathStepType.Unary;
}

export const unaryMathStepSchema = z
  .object({
    operation: z.enum(UnaryMathOperationType).meta({ title: "Operation" }),
    type: z.literal(MathStepType.Unary).readonly(),
  })
  .meta({ title: MathStepType.Unary }) satisfies z.ZodType<UnaryMathStep>;
