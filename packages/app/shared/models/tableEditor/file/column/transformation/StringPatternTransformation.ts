import type { ItemEntityType } from "@esposter/shared";
import type { WithSourceColumnIds } from "#shared/models/tableEditor/file/column/transformation/WithSourceColumnIds";

import { createItemEntityTypeSchema } from "@esposter/shared";
import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
import { withSourceColumnIdsSchema } from "#shared/models/tableEditor/file/column/transformation/WithSourceColumnIds";
import { z } from "zod";

export interface StringPatternTransformation
  extends WithSourceColumnIds, ItemEntityType<ColumnTransformationType.StringPattern> {
  pattern: string;
}

export const stringPatternTransformationSchema = z
  .object({
    ...withSourceColumnIdsSchema.shape,
    ...createItemEntityTypeSchema(z.literal(ColumnTransformationType.StringPattern).readonly()).shape,
    pattern: z.string().meta({
      comp: "PatternInput",
      title: "Pattern",
    }),
    sourceColumnIds: z
      .array(
        z.string().meta({
          comp: "select",
          getItems: "context.stringSourceColumnItems",
          title: "Source Column",
        }),
      )
      .default([])
      .meta({ title: "Source Columns" }),
  })
  .meta({
    applicableColumnTypes: [ColumnType.String],
    title: ColumnTransformationType.StringPattern,
  }) satisfies z.ZodType<StringPatternTransformation>;
