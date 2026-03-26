import type { WithSourceColumnId } from "#shared/models/tableEditor/file/column/transformation/WithSourceColumnId";

import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
import { DatePartType } from "#shared/models/tableEditor/file/column/transformation/DatePartType";
import { withSourceColumnIdSchema } from "#shared/models/tableEditor/file/column/transformation/WithSourceColumnId";
import { z } from "zod";

export interface DatePartTransformation extends WithSourceColumnId {
  part: DatePartType;
  readonly type: ColumnTransformationType.DatePart;
}

export const datePartTransformationSchema = withSourceColumnIdSchema
  .extend({
    part: z.enum(DatePartType).meta({ title: "Part" }),
    sourceColumnId: withSourceColumnIdSchema.shape.sourceColumnId.meta({
      getItems: "context.dateSourceColumnItems",
    }),
    type: z.literal(ColumnTransformationType.DatePart).readonly(),
  })
  .meta({
    applicableColumnTypes: [ColumnType.Date],
    title: ColumnTransformationType.DatePart,
  }) satisfies z.ZodType<DatePartTransformation>;
