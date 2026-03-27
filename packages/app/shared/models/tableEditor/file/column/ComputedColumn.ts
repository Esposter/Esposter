import type { ColumnFormat } from "#shared/models/tableEditor/file/column/ColumnFormat";
import type { Format } from "#shared/models/tableEditor/file/column/Format";
import type { ColumnTransformation } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformation";
import type { ToData } from "@esposter/shared";

import { AColumn, createAColumnSchema } from "#shared/models/tableEditor/file/column/AColumn";
import { columnFormatSchema } from "#shared/models/tableEditor/file/column/ColumnFormat";
import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { createFormatSchema } from "#shared/models/tableEditor/file/column/Format";
import { columnTransformationSchema } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformation";
import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
import { z } from "zod";

export class ComputedColumn extends AColumn<ColumnType.Computed> implements Format<ColumnFormat> {
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
  format: createFormatSchema(columnFormatSchema),
  transformation: columnTransformationSchema,
}) satisfies z.ZodType<ToData<ComputedColumn>>;
