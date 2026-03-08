import type { ToData } from "@esposter/shared";

import { Column, columnSchema } from "#shared/models/tableEditor/file/Column";
import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import { z } from "zod";

export class DateColumn extends Column {
  format: string = "";
  override readonly type: ColumnType = ColumnType.Date;

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
