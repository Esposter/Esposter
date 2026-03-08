import type { ToData } from "@esposter/shared";

import { Column, columnFormSchema, columnSchema } from "#shared/models/tableEditor/file/Column";
import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import { DATE_FORMATS } from "#shared/models/tableEditor/file/constants";
import { z } from "zod";

export class DateColumn extends Column<ColumnType.Date> {
  format = "";
  override readonly type = ColumnType.Date;

  constructor(init?: Partial<DateColumn>) {
    super();
    Object.assign(this, init);
  }
}

export const dateColumnSchema = z.object({
  ...columnSchema.shape,
  format: z.string().default(""),
  type: z.literal(ColumnType.Date).readonly(),
}) satisfies z.ZodType<ToData<DateColumn>>;

export const dateColumnFormSchema = columnFormSchema.extend({
  format: z.union(DATE_FORMATS.map((format) => z.literal(format))).meta({ title: "Format" }),
});
