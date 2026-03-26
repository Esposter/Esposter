import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
import { withSourceColumnIdSchema } from "#shared/models/tableEditor/file/column/transformation/WithSourceColumnId";
import { z } from "zod";

export const convertToTransformationSchema = withSourceColumnIdSchema
  .extend({
    targetType: z.enum([ColumnType.Boolean, ColumnType.Date, ColumnType.Number, ColumnType.String]).meta({
      title: "Target Type",
    }),
    type: z.literal(ColumnTransformationType.ConvertTo),
  })
  .meta({ title: ColumnTransformationType.ConvertTo });

export type ConvertToTransformation = z.infer<typeof convertToTransformationSchema>;
