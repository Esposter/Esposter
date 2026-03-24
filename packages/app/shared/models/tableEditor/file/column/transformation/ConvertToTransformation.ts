import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
import { withSourceColumnSchema } from "#shared/models/tableEditor/file/column/transformation/WithSourceColumn";
import { DATE_FORMATS } from "#shared/models/tableEditor/file/constants";
import { z } from "zod";

export const convertToTransformationSchema = withSourceColumnSchema.extend({
  dateFormat: z.enum(DATE_FORMATS).optional(),
  targetType: z.enum([ColumnType.Boolean, ColumnType.Date, ColumnType.Number, ColumnType.String]),
  type: z.literal(ColumnTransformationType.ConvertTo),
});

export type ConvertToTransformation = z.infer<typeof convertToTransformationSchema>;

export const convertToTransformationFormSchema = z.object({
  ...withSourceColumnSchema.shape,
  dateFormat: convertToTransformationSchema.shape.dateFormat.meta({ title: "Date Format" }),
  targetType: convertToTransformationSchema.shape.targetType.meta({ title: "Target Type" }),
});
