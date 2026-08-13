import type { Format } from "#shared/models/resource/sheet/column/Format";
import type { ToData } from "@esposter/shared";

import { AColumn, createAColumnSchema } from "#shared/models/resource/sheet/column/AColumn";
import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { DateFormat, dateFormatSchema } from "#shared/models/resource/sheet/column/DateFormat";
import { z } from "zod";

export class DateColumn extends AColumn<ColumnType.Date> implements Format<DateFormat> {
  format: DateFormat = DateFormat["D/M/YYYY"];
  override readonly type = ColumnType.Date;

  constructor(init?: Partial<DateColumn>) {
    super();
    Object.assign(this, init);
  }
}

export const dateColumnSchema = z.object({
  ...createAColumnSchema(z.literal(ColumnType.Date)).shape,
  format: dateFormatSchema,
}) satisfies z.ZodType<ToData<DateColumn>>;
