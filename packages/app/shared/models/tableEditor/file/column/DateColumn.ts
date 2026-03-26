import type { AColumnForm } from "#shared/models/tableEditor/file/column/ColumnForm";
import type { ToData } from "@esposter/shared";

import { AColumn, createAColumnSchema } from "#shared/models/tableEditor/file/column/AColumn";
import { createAColumnFormSchema } from "#shared/models/tableEditor/file/column/ColumnForm";
import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { DATE_FORMATS } from "#shared/models/tableEditor/file/constants";
import { z } from "zod";

export class DateColumn extends AColumn<ColumnType.Date> {
  format: (typeof DATE_FORMATS)[number] = DATE_FORMATS[0];
  override readonly type = ColumnType.Date;

  constructor(init?: Partial<DateColumn>) {
    super();
    Object.assign(this, init);
  }
}

export const dateColumnSchema = createAColumnSchema(z.literal(ColumnType.Date)).extend({
  format: z.enum(DATE_FORMATS),
}) satisfies z.ZodType<ToData<DateColumn>>;

export const dateColumnFormSchema = createAColumnFormSchema(z.literal(ColumnType.Date).readonly())
  .extend({
    format: dateColumnSchema.shape.format.meta({ title: "Format" }),
  })
  .meta({ title: ColumnType.Date }) satisfies z.ZodType<AColumnForm>;
