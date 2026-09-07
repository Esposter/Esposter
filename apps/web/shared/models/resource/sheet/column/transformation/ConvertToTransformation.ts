import type { SourceColumnId } from "#shared/models/resource/sheet/column/transformation/SourceColumnId";
import type { ItemEntityType } from "@esposter/shared";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { ColumnTransformationType } from "#shared/models/resource/sheet/column/transformation/ColumnTransformationType";
import { sourceColumnIdSchema } from "#shared/models/resource/sheet/column/transformation/SourceColumnId";
import { createItemEntityTypeSchema } from "@esposter/shared";
import { z } from "zod";

export interface ConvertToTransformation extends ItemEntityType<ColumnTransformationType.ConvertTo>, SourceColumnId {
  targetType: ColumnType.Boolean | ColumnType.Date | ColumnType.Number | ColumnType.String;
}

export const convertToTransformationSchema = z.object({
  ...createItemEntityTypeSchema(z.literal(ColumnTransformationType.ConvertTo).readonly()).shape,
  ...sourceColumnIdSchema.shape,
  targetType: z.enum([ColumnType.Boolean, ColumnType.Date, ColumnType.Number, ColumnType.String]),
}) satisfies z.ZodType<ConvertToTransformation>;
