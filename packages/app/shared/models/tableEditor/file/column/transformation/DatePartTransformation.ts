import type { SourceColumnId } from "#shared/models/tableEditor/file/column/transformation/SourceColumnId";
import type { ItemEntityType } from "@esposter/shared";

import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
import { DatePartType, datePartTypeSchema } from "#shared/models/tableEditor/file/column/transformation/DatePartType";
import { createSourceColumnIdSchema } from "#shared/models/tableEditor/file/column/transformation/SourceColumnId";
import { createItemEntityTypeSchema } from "@esposter/shared";
import { z } from "zod";

export interface DatePartTransformation extends ItemEntityType<ColumnTransformationType.DatePart>, SourceColumnId {
  part: DatePartType;
}

export const datePartTransformationSchema = z
  .object({
    ...createItemEntityTypeSchema(z.literal(ColumnTransformationType.DatePart).readonly()).shape,
    ...createSourceColumnIdSchema("context.dateColumnItems").shape,
    part: datePartTypeSchema,
  })
  .meta({
    applicableColumnTypes: [ColumnType.Date],
    title: ColumnTransformationType.DatePart,
  }) satisfies z.ZodType<DatePartTransformation>;
