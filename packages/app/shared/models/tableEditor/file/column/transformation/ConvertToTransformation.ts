import type { WithSourceColumnId } from "#shared/models/tableEditor/file/column/transformation/WithSourceColumnId";
import type { ItemEntityType } from "@esposter/shared";

import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
import { withSourceColumnIdSchema } from "#shared/models/tableEditor/file/column/transformation/WithSourceColumnId";
import { createItemEntityTypeSchema } from "@esposter/shared";
import { z } from "zod";

export interface ConvertToTransformation
  extends ItemEntityType<ColumnTransformationType.ConvertTo>, WithSourceColumnId {
  targetType: ColumnType.Boolean | ColumnType.Date | ColumnType.Number | ColumnType.String;
}

export const convertToTransformationSchema = z
  .object({
    ...withSourceColumnIdSchema.shape,
    ...createItemEntityTypeSchema(z.literal(ColumnTransformationType.ConvertTo).readonly()).shape,
    targetType: z.enum([ColumnType.Boolean, ColumnType.Date, ColumnType.Number, ColumnType.String]).meta({
      title: "Target Type",
    }),
  })
  .meta({ title: ColumnTransformationType.ConvertTo }) satisfies z.ZodType<ConvertToTransformation>;
