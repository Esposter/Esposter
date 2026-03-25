import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
import { withSourceColumnSchema } from "#shared/models/tableEditor/file/column/transformation/WithSourceColumn";
import { DATE_FORMATS } from "#shared/models/tableEditor/file/constants";
import { z } from "zod";

export const convertToTransformationSchema = withSourceColumnSchema
  .extend({
    dateFormat: z.enum(DATE_FORMATS).optional().meta({ title: "Date Format" }),
    targetType: z.enum([ColumnType.Boolean, ColumnType.Date, ColumnType.Number, ColumnType.String]).meta({
      title: "Target Type",
    }),
    type: z.literal(ColumnTransformationType.ConvertTo),
  })
  .meta({ title: "Convert To" });

export type ConvertToTransformation = z.infer<typeof convertToTransformationSchema>;
