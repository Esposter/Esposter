import type { ItemEntityType } from "@esposter/shared";
import type { WithSourceColumnId } from "#shared/models/tableEditor/file/column/transformation/WithSourceColumnId";

import { createItemEntityTypeSchema } from "@esposter/shared";
import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
import { DatePartType } from "#shared/models/tableEditor/file/column/transformation/DatePartType";
import { withSourceColumnIdSchema } from "#shared/models/tableEditor/file/column/transformation/WithSourceColumnId";
import { z } from "zod";

export interface DatePartTransformation extends WithSourceColumnId, ItemEntityType<ColumnTransformationType.DatePart> {
  part: DatePartType;
}

export const datePartTransformationSchema = z
  .object({
    ...withSourceColumnIdSchema.shape,
    ...createItemEntityTypeSchema(z.literal(ColumnTransformationType.DatePart).readonly()).shape,
    part: z.enum(DatePartType).meta({ title: "Part" }),
    sourceColumnId: withSourceColumnIdSchema.shape.sourceColumnId.meta({
      getItems: "context.dateSourceColumnItems",
    }),
  })
  .meta({
    applicableColumnTypes: [ColumnType.Date],
    title: ColumnTransformationType.DatePart,
  }) satisfies z.ZodType<DatePartTransformation>;
