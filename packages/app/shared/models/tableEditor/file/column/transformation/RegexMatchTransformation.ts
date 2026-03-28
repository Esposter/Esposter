import type { SourceColumnId } from "#shared/models/tableEditor/file/column/transformation/SourceColumnId";
import type { ItemEntityType } from "@esposter/shared";

import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
import { createSourceColumnIdSchema } from "#shared/models/tableEditor/file/column/transformation/SourceColumnId";
import { createItemEntityTypeSchema } from "@esposter/shared";
import { z } from "zod";

export interface RegexMatchTransformation extends ItemEntityType<ColumnTransformationType.RegexMatch>, SourceColumnId {
  groupIndex: number;
  pattern: string;
}

export const regexMatchTransformationSchema = z
  .object({
    ...createItemEntityTypeSchema(z.literal(ColumnTransformationType.RegexMatch).readonly()).shape,
    ...createSourceColumnIdSchema("context.stringColumnItems").shape,
    groupIndex: z.number().int().nonnegative().meta({ title: "Group Index" }),
    pattern: z.string().meta({ title: "Pattern" }),
  })
  .meta({
    applicableColumnTypes: [ColumnType.String],
    title: ColumnTransformationType.RegexMatch,
  }) satisfies z.ZodType<RegexMatchTransformation>;
