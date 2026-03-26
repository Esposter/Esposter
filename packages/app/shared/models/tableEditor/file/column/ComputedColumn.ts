import type { ColumnForm } from "#shared/models/tableEditor/file/column/ColumnForm";
import type { ColumnTransformation } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformation";
import type { ToData } from "@esposter/shared";

import { Column, createColumnSchema } from "#shared/models/tableEditor/file/column/Column";
import { createColumnFormSchema } from "#shared/models/tableEditor/file/column/ColumnForm";
import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { columnTransformationSchema } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformation";
import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
import { z } from "zod";

export class ComputedColumn extends Column<ColumnType.Computed> {
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

export const computedColumnSchema = createColumnSchema(z.literal(ColumnType.Computed)).extend({
  transformation: columnTransformationSchema,
}) satisfies z.ZodType<ToData<ComputedColumn>>;

export const computedColumnFormSchema = createColumnFormSchema(z.literal(ColumnType.Computed).readonly())
  .extend({
    transformation: columnTransformationSchema,
  })
  .meta({ title: ColumnType.Computed }) satisfies z.ZodType<ColumnForm>;
