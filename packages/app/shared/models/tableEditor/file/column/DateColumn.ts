import type { ToData } from "@esposter/shared";

import { AColumn, createAColumnSchema } from "#shared/models/tableEditor/file/column/AColumn";
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

export const dateColumnSchema = z.object({
  ...createAColumnSchema(z.literal(ColumnType.Date)).shape,
  format: z.enum(DATE_FORMATS),
}) satisfies z.ZodType<ToData<DateColumn>>;
