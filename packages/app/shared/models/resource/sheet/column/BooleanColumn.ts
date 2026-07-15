import type { Format } from "#shared/models/resource/sheet/column/Format";
import type { ToData } from "@esposter/shared";

import { AColumn, createAColumnSchema } from "#shared/models/resource/sheet/column/AColumn";
import { BooleanFormat, booleanFormatSchema } from "#shared/models/resource/sheet/column/BooleanFormat";
import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { createFormatSchema } from "#shared/models/resource/sheet/column/Format";
import { z } from "zod";

export class BooleanColumn extends AColumn<ColumnType.Boolean> implements Partial<Format<BooleanFormat>> {
  format?: BooleanFormat;
  override readonly type = ColumnType.Boolean;

  constructor(init?: Partial<BooleanColumn>) {
    super();
    Object.assign(this, init);
  }
}

export const booleanColumnSchema = z.object({
  ...createAColumnSchema(z.literal(ColumnType.Boolean)).shape,
  format: createFormatSchema(booleanFormatSchema.optional()),
}) satisfies z.ZodType<ToData<BooleanColumn>>;
