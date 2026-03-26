import type { ColumnTransformation } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformation";
import type { ToData } from "@esposter/shared";

import { AColumn, createAColumnSchema } from "#shared/models/tableEditor/file/column/AColumn";
import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { columnTransformationSchema } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformation";
import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
import { z } from "zod";

export class ComputedColumn extends AColumn<ColumnType.Computed> {
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

export const computedColumnSchema = createAColumnSchema(z.literal(ColumnType.Computed)).extend({
  transformation: columnTransformationSchema,
}) satisfies z.ZodType<ToData<ComputedColumn>>;
