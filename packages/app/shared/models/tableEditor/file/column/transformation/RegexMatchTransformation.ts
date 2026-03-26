import type { ItemEntityType } from "@esposter/shared";
import type { WithSourceColumnId } from "#shared/models/tableEditor/file/column/transformation/WithSourceColumnId";

import { createItemEntityTypeSchema } from "@esposter/shared";
import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
import { withSourceColumnIdSchema } from "#shared/models/tableEditor/file/column/transformation/WithSourceColumnId";
import { z } from "zod";

export interface RegexMatchTransformation
  extends WithSourceColumnId, ItemEntityType<ColumnTransformationType.RegexMatch> {
  groupIndex: number;
  pattern: string;
}

export const regexMatchTransformationSchema = z
  .object({
    ...withSourceColumnIdSchema.shape,
    ...createItemEntityTypeSchema(z.literal(ColumnTransformationType.RegexMatch).readonly()).shape,
    groupIndex: z.number().int().nonnegative().meta({ title: "Group Index" }),
    pattern: z.string().meta({ title: "Pattern" }),
    sourceColumnId: withSourceColumnIdSchema.shape.sourceColumnId.meta({
      getItems: "context.stringSourceColumnItems",
    }),
  })
  .meta({
    applicableColumnTypes: [ColumnType.String],
    title: ColumnTransformationType.RegexMatch,
  }) satisfies z.ZodType<RegexMatchTransformation>;
