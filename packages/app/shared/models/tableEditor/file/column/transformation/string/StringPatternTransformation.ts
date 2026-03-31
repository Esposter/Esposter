import type { SourceColumnIds } from "#shared/models/tableEditor/file/column/transformation/SourceColumnIds";
import type { ItemEntityType } from "@esposter/shared";

import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
import { createSourceColumnIdsSchema } from "#shared/models/tableEditor/file/column/transformation/SourceColumnIds";
import { createItemEntityTypeSchema } from "@esposter/shared";
import { z } from "zod";

export interface StringPatternTransformation
  extends ItemEntityType<ColumnTransformationType.StringPattern>, SourceColumnIds {
  pattern: string;
}

export const stringPatternTransformationSchema = z
  .object({
    ...createItemEntityTypeSchema(z.literal(ColumnTransformationType.StringPattern).readonly()).shape,
    ...createSourceColumnIdsSchema().shape,
    pattern: z.string(),
  })
  .superRefine(({ pattern, sourceColumnIds }, ctx) => {
    const matches = pattern.matchAll(/\{(\d+)\}/g);

    for (const match of matches) {
      const index = Number(match[1]);

      if (index >= sourceColumnIds.length) {
        ctx.addIssue({
          code: "custom",
          message: `{${index}} index out of range`,
          path: ["pattern"],
        });
      }
    }
  })
  .meta({
    title: ColumnTransformationType.StringPattern,
  }) satisfies z.ZodType<StringPatternTransformation>;
