import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
import { DatePartType } from "#shared/models/tableEditor/file/column/transformation/DatePartType";
import { withSourceColumnSchema } from "#shared/models/tableEditor/file/column/transformation/WithSourceColumn";
import { DATE_FORMATS } from "#shared/models/tableEditor/file/constants";
import { z } from "zod";

export const datePartTransformationSchema = withSourceColumnSchema.extend({
  inputFormat: z.enum(DATE_FORMATS).meta({ title: "Input Format" }),
  part: z.enum(DatePartType).meta({ title: "Part" }),
  type: z.literal(ColumnTransformationType.DatePart),
});

export type DatePartTransformation = z.infer<typeof datePartTransformationSchema>;
