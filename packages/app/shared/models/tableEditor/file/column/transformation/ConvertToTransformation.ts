import type { WithSourceColumnId } from "#shared/models/tableEditor/file/column/transformation/WithSourceColumnId";

import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
import { withSourceColumnIdSchema } from "#shared/models/tableEditor/file/column/transformation/WithSourceColumnId";
import { z } from "zod";

export interface ConvertToTransformation extends WithSourceColumnId {
  targetType: ColumnType.Boolean | ColumnType.Date | ColumnType.Number | ColumnType.String;
  readonly type: ColumnTransformationType.ConvertTo;
}

export const convertToTransformationSchema = withSourceColumnIdSchema
  .extend({
    targetType: z.enum([ColumnType.Boolean, ColumnType.Date, ColumnType.Number, ColumnType.String]).meta({
      title: "Target Type",
    }),
    type: z.literal(ColumnTransformationType.ConvertTo).readonly(),
  })
  .meta({ title: ColumnTransformationType.ConvertTo }) satisfies z.ZodType<ConvertToTransformation>;
