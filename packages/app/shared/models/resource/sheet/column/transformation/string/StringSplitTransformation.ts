import type { SourceColumnId } from "#shared/models/resource/sheet/column/transformation/SourceColumnId";
import type { ItemEntityType } from "@esposter/shared";

import { ColumnTransformationType } from "#shared/models/resource/sheet/column/transformation/ColumnTransformationType";
import { sourceColumnIdSchema } from "#shared/models/resource/sheet/column/transformation/SourceColumnId";
import { createItemEntityTypeSchema } from "@esposter/shared";
import { z } from "zod";

export interface StringSplitTransformation
  extends ItemEntityType<ColumnTransformationType.StringSplit>, SourceColumnId {
  delimiter: string;
  segmentIndex: number;
}

export const stringSplitTransformationSchema = z.object({
  ...createItemEntityTypeSchema(z.literal(ColumnTransformationType.StringSplit).readonly()).shape,
  ...sourceColumnIdSchema.shape,
  delimiter: z.string().default(","),
  segmentIndex: z.int().nonnegative().default(0),
}) satisfies z.ZodType<StringSplitTransformation>;
