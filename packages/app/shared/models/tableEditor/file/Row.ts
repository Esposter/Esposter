import type { ColumnValue } from "#shared/models/tableEditor/file/ColumnValue";
import type { ToData } from "@esposter/shared";

import { AItemEntity, aItemEntitySchema } from "#shared/models/entity/AItemEntity";
import { columnValueSchema } from "#shared/models/tableEditor/file/ColumnValue";
import { z } from "zod";

export class Row extends AItemEntity {
  data: Record<string, ColumnValue> = {};

  constructor(init?: Partial<Row>) {
    super();
    Object.assign(this, init);
  }
}

export const rowSchema = z.object({
  ...aItemEntitySchema.shape,
  data: z.record(z.string(), columnValueSchema),
}) satisfies z.ZodType<ToData<Row>>;
