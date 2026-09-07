import type { SourceColumnId } from "#shared/models/resource/sheet/column/transformation/SourceColumnId";
import type { ItemEntityType } from "@esposter/shared";

import { ColumnTransformationType } from "#shared/models/resource/sheet/column/transformation/ColumnTransformationType";
import { sourceColumnIdSchema } from "#shared/models/resource/sheet/column/transformation/SourceColumnId";
import { createItemEntityTypeSchema } from "@esposter/shared";
import { z } from "zod";

export interface RegexMatchTransformation extends ItemEntityType<ColumnTransformationType.RegexMatch>, SourceColumnId {
  groupIndex: number;
  pattern: string;
}

export const regexMatchTransformationSchema = z.object({
  ...createItemEntityTypeSchema(z.literal(ColumnTransformationType.RegexMatch).readonly()).shape,
  ...sourceColumnIdSchema.shape,
  groupIndex: z.int().nonnegative(),
  pattern: z.string(),
}) satisfies z.ZodType<RegexMatchTransformation>;
