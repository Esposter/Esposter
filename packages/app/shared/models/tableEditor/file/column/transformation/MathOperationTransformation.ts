import type { MathOperationVariable } from "#shared/models/tableEditor/file/column/transformation/MathOperationVariable";
import type { ItemEntityType } from "@esposter/shared";

import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
import { mathOperationVariableSchema } from "#shared/models/tableEditor/file/column/transformation/MathOperationVariable";
import { createItemEntityTypeSchema } from "@esposter/shared";
import { parse } from "mathjs";
import { z } from "zod";

export interface MathOperationTransformation extends ItemEntityType<ColumnTransformationType.MathOperation> {
  expression: string;
  variables: MathOperationVariable[];
}

export const mathOperationTransformationSchema = z
  .object({
    ...createItemEntityTypeSchema(z.literal(ColumnTransformationType.MathOperation).readonly()).shape,
    expression: z.string().meta({ title: "Expression" }),
    variables: z.array(mathOperationVariableSchema).meta({ title: "Variables" }),
  })
  .superRefine(({ expression }, ctx) => {
    try {
      parse(expression);
    } catch (error) {
      ctx.addIssue({
        code: "custom",
        message: error instanceof Error ? error.message : "Invalid expression",
        path: ["expression"],
      });
    }
  })
  .meta({ title: ColumnTransformationType.MathOperation }) satisfies z.ZodType<MathOperationTransformation>;
