import type { ToData } from "@esposter/shared";

import { AColumn, createAColumnSchema } from "#shared/models/tableEditor/file/column/AColumn";
import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { BooleanFormat, booleanFormatSchema } from "#shared/models/tableEditor/file/column/BooleanFormat";
import { z } from "zod";

export class BooleanColumn extends AColumn<ColumnType.Boolean> {
  format?: BooleanFormat;
  override readonly type = ColumnType.Boolean;

  constructor(init?: Partial<BooleanColumn>) {
    super();
    Object.assign(this, init);
  }
}

export const booleanColumnSchema = z.object({
  ...createAColumnSchema(z.literal(ColumnType.Boolean)).shape,
  format: booleanFormatSchema.optional(),
}) satisfies z.ZodType<ToData<BooleanColumn>>;
