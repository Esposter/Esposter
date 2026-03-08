import type { ToData } from "@esposter/shared";

import { DATE_FORMATS } from "#shared/models/tableEditor/file/constants";
import { Column, columnFormSchema, columnSchema } from "#shared/models/tableEditor/file/Column";
import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import { z } from "zod";

export class DateColumn extends Column {
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

const dateFormatSchemas = DATE_FORMATS.map((format) =>
  z.literal(format).meta({ title: format }),
) as [z.ZodLiteral<string>, z.ZodLiteral<string>, ...z.ZodLiteral<string>[]];

export const dateColumnFormSchema = columnFormSchema.extend({
  format: z.union(dateFormatSchemas).meta({ title: "Format" }),
});
