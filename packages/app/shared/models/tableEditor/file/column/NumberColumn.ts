import type { ToData } from "@esposter/shared";

import { AColumn, createAColumnSchema } from "#shared/models/tableEditor/file/column/AColumn";
import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { NumberFormat, numberFormatSchema } from "#shared/models/tableEditor/file/column/NumberFormat";
import { z } from "zod";

export class NumberColumn extends AColumn<ColumnType.Number> {
  format?: NumberFormat;
  override readonly type = ColumnType.Number;

  constructor(init?: Partial<NumberColumn>) {
    super();
    Object.assign(this, init);
  }
}

export const numberColumnSchema = z.object({
  ...createAColumnSchema(z.literal(ColumnType.Number)).shape,
  format: numberFormatSchema.optional(),
}) satisfies z.ZodType<ToData<NumberColumn>>;
