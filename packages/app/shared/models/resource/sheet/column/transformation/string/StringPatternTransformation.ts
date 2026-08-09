import type { SourceColumnIds } from "#shared/models/resource/sheet/column/transformation/SourceColumnIds";
import type { ItemEntityType } from "@esposter/shared";

import { Delimiter } from "#shared/models/compiler/Delimiter";
import { DelimiterRegexMap } from "#shared/models/compiler/DelimiterRegexMap";
import { ColumnTransformationType } from "#shared/models/resource/sheet/column/transformation/ColumnTransformationType";
import { sourceColumnIdsSchema } from "#shared/models/resource/sheet/column/transformation/SourceColumnIds";
import { createItemEntityTypeSchema } from "@esposter/shared";
import { z } from "zod";

export interface StringPatternTransformation
  extends ItemEntityType<ColumnTransformationType.StringPattern>, SourceColumnIds {
  pattern: string;
}

export const stringPatternTransformationSchema = z
  .object({
    ...createItemEntityTypeSchema(z.literal(ColumnTransformationType.StringPattern).readonly()).shape,
    ...sourceColumnIdsSchema.shape,
    pattern: z.string(),
  })
  .superRefine(({ pattern, sourceColumnIds }, ctx) => {
    for (const [, indexString] of pattern.matchAll(DelimiterRegexMap[Delimiter.CurlyBraces])) {
      const index = Number(indexString);
      if (index >= sourceColumnIds.length)
        ctx.addIssue({
          code: "custom",
          message: `{${index}} index out of range`,
          path: ["pattern"],
        });
    }
  })
  .meta({
    title: ColumnTransformationType.StringPattern,
  }) satisfies z.ZodType<StringPatternTransformation>;
