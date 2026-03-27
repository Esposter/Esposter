import type { SourceColumnIds } from "#shared/models/tableEditor/file/column/transformation/SourceColumnIds";
import type { ItemEntityType } from "@esposter/shared";

import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
import { sourceColumnIdsSchema } from "#shared/models/tableEditor/file/column/transformation/SourceColumnIds";
import { createItemEntityTypeSchema } from "@esposter/shared";
import { z } from "zod";

export interface StringPatternTransformation
  extends ItemEntityType<ColumnTransformationType.StringPattern>, SourceColumnIds {
  pattern: string;
}

export const stringPatternTransformationSchema = z
  .object({
    ...sourceColumnIdsSchema.shape,
    ...createItemEntityTypeSchema(z.literal(ColumnTransformationType.StringPattern).readonly()).shape,
    pattern: z.string().meta({
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
