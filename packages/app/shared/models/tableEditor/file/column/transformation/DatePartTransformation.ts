import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
import { DatePartType } from "#shared/models/tableEditor/file/column/transformation/DatePartType";
import { withSourceColumnIdSchema } from "#shared/models/tableEditor/file/column/transformation/WithSourceColumnId";
import { z } from "zod";

export const datePartTransformationSchema = withSourceColumnIdSchema
  .extend({
    part: z.enum(DatePartType).meta({ title: "Part" }),
    sourceColumnId: withSourceColumnIdSchema.shape.sourceColumnId.meta({
      getItems: "context.dateSourceColumnItems",
    }),
    type: z.literal(ColumnTransformationType.DatePart),
  })
  .meta({ applicableColumnTypes: [ColumnType.Date], title: ColumnTransformationType.DatePart });

export type DatePartTransformation = z.infer<typeof datePartTransformationSchema>;
