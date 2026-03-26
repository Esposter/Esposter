import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
import { DatePartType } from "#shared/models/tableEditor/file/column/transformation/DatePartType";
import { withSourceColumnIdSchema } from "#shared/models/tableEditor/file/column/transformation/WithSourceColumnId";
import { DATE_FORMATS } from "#shared/models/tableEditor/file/constants";
import { z } from "zod";

export const datePartTransformationSchema = withSourceColumnIdSchema
  .extend({
    inputFormat: z.enum(DATE_FORMATS).meta({ title: "Input Format" }),
    part: z.enum(DatePartType).meta({ title: "Part" }),
    type: z.literal(ColumnTransformationType.DatePart),
  })
  .meta({ title: ColumnTransformationType.DatePart });

export type DatePartTransformation = z.infer<typeof datePartTransformationSchema>;
