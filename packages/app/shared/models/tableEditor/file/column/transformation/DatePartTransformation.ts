import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
import { DatePartType } from "#shared/models/tableEditor/file/column/transformation/DatePartType";
import { withSourceColumnSchema } from "#shared/models/tableEditor/file/column/transformation/WithSourceColumn";
import { DATE_FORMATS } from "#shared/models/tableEditor/file/constants";
import { z } from "zod";

export const datePartTransformationSchema = withSourceColumnSchema.extend({
  inputFormat: z.enum(DATE_FORMATS),
  part: z.enum(DatePartType),
  type: z.literal(ColumnTransformationType.DatePart),
});

export type DatePartTransformation = z.infer<typeof datePartTransformationSchema>;

export const datePartTransformationFormSchema = z.object({
  ...withSourceColumnSchema.shape,
  inputFormat: datePartTransformationSchema.shape.inputFormat.meta({ title: "Input Format" }),
  part: datePartTransformationSchema.shape.part.meta({ title: "Part" }),
});
