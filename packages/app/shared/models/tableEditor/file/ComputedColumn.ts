import type { ToData } from "@esposter/shared";

import { Column, createColumnSchema } from "#shared/models/tableEditor/file/Column";
import {
  columnTransformationSchema,
  type ColumnTransformation,
} from "#shared/models/tableEditor/file/ColumnTransformation";
import { ColumnTransformationType } from "#shared/models/tableEditor/file/ColumnTransformationType";
import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import { z } from "zod";

export class ComputedColumn extends Column<ColumnType.Computed> {
  override readonly type = ColumnType.Computed;
  sourceColumnId: string = "";
  transformation: ColumnTransformation = { type: ColumnTransformationType.ConvertTo, targetType: ColumnType.String };

  constructor(init?: Partial<ComputedColumn>) {
    super();
    Object.assign(this, init);
  }
}

export const computedColumnSchema = createColumnSchema(z.literal(ColumnType.Computed)).extend({
  sourceColumnId: z.string(),
  transformation: columnTransformationSchema,
}) satisfies z.ZodType<ToData<ComputedColumn>>;
