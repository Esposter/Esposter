import type { ToData } from "@esposter/shared";

import { AColumn, createAColumnSchema } from "#shared/models/tableEditor/file/column/AColumn";
import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { DateFormat } from "#shared/models/tableEditor/file/column/DateFormat";
import { z } from "zod";

export class DateColumn extends AColumn<ColumnType.Date> {
  format: DateFormat = DateFormat["D/M/YYYY"];
  override readonly type = ColumnType.Date;

  constructor(init?: Partial<DateColumn>) {
    super();
    Object.assign(this, init);
  }
}

export const dateColumnSchema = z.object({
  ...createAColumnSchema(z.literal(ColumnType.Date)).shape,
  format: z.enum(DateFormat),
}) satisfies z.ZodType<ToData<DateColumn>>;
