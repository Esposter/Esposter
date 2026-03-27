import type { SourceColumnId } from "#shared/models/tableEditor/file/column/transformation/SourceColumnId";
import type { ItemEntityType } from "@esposter/shared";

import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
import { sourceColumnIdSchema } from "#shared/models/tableEditor/file/column/transformation/SourceColumnId";
import { createItemEntityTypeSchema } from "@esposter/shared";
import { z } from "zod";

export interface RegexMatchTransformation extends ItemEntityType<ColumnTransformationType.RegexMatch>, SourceColumnId {
  groupIndex: number;
  pattern: string;
}

export const regexMatchTransformationSchema = z
  .object({
    ...sourceColumnIdSchema.shape,
    ...createItemEntityTypeSchema(z.literal(ColumnTransformationType.RegexMatch).readonly()).shape,
    groupIndex: z.number().int().nonnegative().meta({ title: "Group Index" }),
    pattern: z.string().meta({ title: "Pattern" }),
    sourceColumnId: sourceColumnIdSchema.shape.sourceColumnId.meta({
      getItems: "context.stringColumnItems",
    }),
  })
  .meta({
    applicableColumnTypes: [ColumnType.String],
    title: ColumnTransformationType.RegexMatch,
  }) satisfies z.ZodType<RegexMatchTransformation>;
