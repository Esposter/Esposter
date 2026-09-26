import type { MathVariable } from "#shared/models/resource/sheet/column/transformation/MathVariable";
import type { ItemEntityType } from "@esposter/shared";

import { ColumnTransformationType } from "#shared/models/resource/sheet/column/transformation/ColumnTransformationType";
import { mathVariableSchema } from "#shared/models/resource/sheet/column/transformation/MathVariable";
import { MAX_RESOURCE_CONTENT_SIZE } from "#shared/services/resource/constants";
import { createItemEntityTypeSchema, createUniqueArraySchema, getResult, noop } from "@esposter/shared";
import { parse } from "mathjs";
import { z } from "zod";

export interface MathTransformation extends ItemEntityType<ColumnTransformationType.Math> {
  expression: string;
  variables: MathVariable[];
}

export const mathTransformationSchema = z
  .object({
    ...createItemEntityTypeSchema(z.literal(ColumnTransformationType.Math).readonly()).shape,
    expression: z.string().max(MAX_RESOURCE_CONTENT_SIZE),
    variables: createUniqueArraySchema(mathVariableSchema, "name").max(MAX_RESOURCE_CONTENT_SIZE),
  })
  .superRefine(({ expression }, ctx) => {
    getResult(() => parse(expression)).match(noop, (error) => {
      ctx.addIssue({
        code: "custom",
        message: error instanceof Error ? error.message : "Invalid expression",
        path: ["expression"],
      });
    });
  }) satisfies z.ZodType<MathTransformation>;
