import type { ToData } from "@esposter/shared";

import { AColumn, createAColumnSchema } from "#shared/models/resource/sheet/column/AColumn";
import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { z } from "zod";

export class StringColumn extends AColumn<ColumnType.String> {
  override readonly type = ColumnType.String;

  constructor(init?: Partial<StringColumn>) {
    super();
    Object.assign(this, init);
  }
}

export const stringColumnSchema = createAColumnSchema(z.literal(ColumnType.String)) satisfies z.ZodType<
  ToData<StringColumn>
>;
