import type { SourceColumnId } from "#shared/models/resource/sheet/column/transformation/SourceColumnId";
import type { ItemEntityType } from "@esposter/shared";

import { ColumnTransformationType } from "#shared/models/resource/sheet/column/transformation/ColumnTransformationType";
import { DatePartType, datePartTypeSchema } from "#shared/models/resource/sheet/column/transformation/DatePartType";
import { sourceColumnIdSchema } from "#shared/models/resource/sheet/column/transformation/SourceColumnId";
import { createItemEntityTypeSchema } from "@esposter/shared";
import { z } from "zod";

export interface DatePartTransformation extends ItemEntityType<ColumnTransformationType.DatePart>, SourceColumnId {
  datePartType: DatePartType;
}

export const datePartTransformationSchema = z.object({
  ...createItemEntityTypeSchema(z.literal(ColumnTransformationType.DatePart).readonly()).shape,
  ...sourceColumnIdSchema.shape,
  datePartType: datePartTypeSchema,
}) satisfies z.ZodType<DatePartTransformation>;
