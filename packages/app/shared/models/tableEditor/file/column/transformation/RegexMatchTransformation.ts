import type { WithSourceColumnId } from "#shared/models/tableEditor/file/column/transformation/WithSourceColumnId";

import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
import { withSourceColumnIdSchema } from "#shared/models/tableEditor/file/column/transformation/WithSourceColumnId";
import { z } from "zod";

export interface RegexMatchTransformation extends WithSourceColumnId {
  groupIndex: number;
  pattern: string;
  readonly type: ColumnTransformationType.RegexMatch;
}

export const regexMatchTransformationSchema = withSourceColumnIdSchema
  .extend({
    groupIndex: z.number().int().nonnegative().meta({ title: "Group Index" }),
    pattern: z.string().meta({ title: "Pattern" }),
    sourceColumnId: withSourceColumnIdSchema.shape.sourceColumnId.meta({
      getItems: "context.stringSourceColumnItems",
    }),
    type: z.literal(ColumnTransformationType.RegexMatch).readonly(),
  })
  .meta({
    applicableColumnTypes: [ColumnType.String],
    title: ColumnTransformationType.RegexMatch,
  }) satisfies z.ZodType<RegexMatchTransformation>;
