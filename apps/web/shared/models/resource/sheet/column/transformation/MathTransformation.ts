import type { MathVariable } from "#shared/models/resource/sheet/column/transformation/MathVariable";
import type { ItemEntityType } from "@esposter/shared";

import { ColumnTransformationType } from "#shared/models/resource/sheet/column/transformation/ColumnTransformationType";
import { mathVariableSchema } from "#shared/models/resource/sheet/column/transformation/MathVariable";
import { MAX_RESOURCE_CONTENT_SIZE } from "#shared/services/resource/constants";
import { createItemEntityTypeSchema, createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

export interface MathTransformation extends ItemEntityType<ColumnTransformationType.Math> {
  expression: string;
  variables: MathVariable[];
}

// The stored schema reads a sheet on every open and patch, so it checks only the expression's size: a formula the parser
// Refuses leaves its column empty rather than stopping the sheet opening, and the edit form refuses it before a save
export const mathTransformationSchema = z.object({
  ...createItemEntityTypeSchema(z.literal(ColumnTransformationType.Math).readonly()).shape,
  expression: z.string().max(MAX_RESOURCE_CONTENT_SIZE),
  variables: createUniqueArraySchema(mathVariableSchema, "name").max(MAX_RESOURCE_CONTENT_SIZE),
}) satisfies z.ZodType<MathTransformation>;
