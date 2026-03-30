import type { SourceColumnId } from "#shared/models/tableEditor/file/column/transformation/SourceColumnId";
import type { ItemEntityType } from "@esposter/shared";

import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
import { createSourceColumnIdSchema } from "#shared/models/tableEditor/file/column/transformation/SourceColumnId";
import { createItemEntityTypeSchema } from "@esposter/shared";
import { z } from "zod";

export interface ConvertToTransformation extends ItemEntityType<ColumnTransformationType.ConvertTo>, SourceColumnId {
  targetType: ColumnType.Boolean | ColumnType.Date | ColumnType.Number | ColumnType.String;
}

export const convertToTransformationSchema = z
  .object({
    ...createItemEntityTypeSchema(z.literal(ColumnTransformationType.ConvertTo).readonly()).shape,
    ...createSourceColumnIdSchema().shape,
    targetType: z.enum([ColumnType.Boolean, ColumnType.Date, ColumnType.Number, ColumnType.String]).meta({
      title: "Target Type",
    }),
  })
  .meta({ title: ColumnTransformationType.ConvertTo }) satisfies z.ZodType<ConvertToTransformation>;
