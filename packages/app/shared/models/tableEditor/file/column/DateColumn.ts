import type { ColumnForm } from "#shared/models/tableEditor/file/column/ColumnForm";
import type { ToData } from "@esposter/shared";

import { Column, createColumnSchema } from "#shared/models/tableEditor/file/column/Column";
import { createColumnFormSchema } from "#shared/models/tableEditor/file/column/ColumnForm";
import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { DATE_FORMATS } from "#shared/models/tableEditor/file/constants";
import { z } from "zod";

export class DateColumn extends Column<ColumnType.Date> {
  format: (typeof DATE_FORMATS)[number] = DATE_FORMATS[0];
  override readonly type = ColumnType.Date;

  constructor(init?: Partial<DateColumn>) {
    super();
    Object.assign(this, init);
  }
}

export const dateColumnSchema = createColumnSchema(z.literal(ColumnType.Date)).extend({
  format: z.enum(DATE_FORMATS),
}) satisfies z.ZodType<ToData<DateColumn>>;

export const dateColumnFormSchema = createColumnFormSchema(z.literal(ColumnType.Date).readonly()).extend({
  format: dateColumnSchema.shape.format.meta({ title: "Format" }),
}) satisfies z.ZodType<ColumnForm>;
