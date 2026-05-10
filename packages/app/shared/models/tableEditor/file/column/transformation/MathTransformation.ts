import type { MathVariable } from "#shared/models/tableEditor/file/column/transformation/MathVariable";
import type { ItemEntityType } from "@esposter/shared";

import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
import { mathVariableSchema } from "#shared/models/tableEditor/file/column/transformation/MathVariable";
import { createItemEntityTypeSchema, getResult, noop } from "@esposter/shared";
import { parse } from "mathjs";
import { z } from "zod";

export interface MathTransformation extends ItemEntityType<ColumnTransformationType.Math> {
  expression: string;
  variables: MathVariable[];
}

export const mathTransformationSchema = z
  .object({
    ...createItemEntityTypeSchema(z.literal(ColumnTransformationType.Math).readonly()).shape,
    expression: z.string(),
    variables: z.array(mathVariableSchema),
  })
  .superRefine(({ expression }, ctx) => {
    getResult(() => parse(expression)).match(noop, (error) => {
      ctx.addIssue({
        code: "custom",
        message: error instanceof Error ? error.message : "Invalid expression",
        path: ["expression"],
      });
    });
  })
  .meta({ title: ColumnTransformationType.Math }) satisfies z.ZodType<MathTransformation>;
