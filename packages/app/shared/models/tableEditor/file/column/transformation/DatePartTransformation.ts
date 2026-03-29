import type { SourceColumnId } from "#shared/models/tableEditor/file/column/transformation/SourceColumnId";
import type { ItemEntityType } from "@esposter/shared";

import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
import { DatePartType, datePartTypeSchema } from "#shared/models/tableEditor/file/column/transformation/DatePartType";
import { createSourceColumnIdSchema } from "#shared/models/tableEditor/file/column/transformation/SourceColumnId";
import { ColumnFormVjsfContextPropertyNames } from "@/models/tableEditor/file/column/ColumnFormVjsfContext";
import { createItemEntityTypeSchema } from "@esposter/shared";
import { z } from "zod";

export interface DatePartTransformation extends ItemEntityType<ColumnTransformationType.DatePart>, SourceColumnId {
  part: DatePartType;
}

export const datePartTransformationSchema = z
  .object({
    ...createItemEntityTypeSchema(z.literal(ColumnTransformationType.DatePart).readonly()).shape,
    ...createSourceColumnIdSchema(ColumnFormVjsfContextPropertyNames["context.dateColumnItems"]).shape,
    part: datePartTypeSchema,
  })
  .meta({ title: ColumnTransformationType.DatePart }) satisfies z.ZodType<DatePartTransformation>;
