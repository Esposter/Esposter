import type { ColumnTransformation } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformation";
import type { ColumnFormat } from "#shared/models/tableEditor/file/column/ColumnFormat";
import type { ToData } from "@esposter/shared";

import { AColumn, createAColumnSchema } from "#shared/models/tableEditor/file/column/AColumn";
import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { booleanFormatSchema } from "#shared/models/tableEditor/file/column/BooleanFormat";
import { dateFormatSchema } from "#shared/models/tableEditor/file/column/DateFormat";
import { numberFormatSchema } from "#shared/models/tableEditor/file/column/NumberFormat";
import { columnTransformationSchema } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformation";
import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
import { z } from "zod";

export class ComputedColumn extends AColumn<ColumnType.Computed> {
  format?: ColumnFormat;
  transformation: ColumnTransformation = {
    sourceColumnId: "",
    targetType: ColumnType.String,
    type: ColumnTransformationType.ConvertTo,
  };
  override readonly type = ColumnType.Computed;

  constructor(init?: Partial<ComputedColumn>) {
    super();
    Object.assign(this, init);
  }
}

export const computedColumnSchema = z.object({
  ...createAColumnSchema(z.literal(ColumnType.Computed)).shape,
  format: z.union([booleanFormatSchema, dateFormatSchema, numberFormatSchema]).optional(),
  transformation: columnTransformationSchema,
}) satisfies z.ZodType<ToData<ComputedColumn>>;
