import type { ColumnValue } from "#shared/models/tableEditor/file/column/ColumnValue";
import type { ToData } from "@esposter/shared";

import { AItemEntity, aItemEntitySchema } from "#shared/models/entity/AItemEntity";
import { descriptionSchema } from "#shared/models/entity/Description";
import { columnValueSchema } from "#shared/models/tableEditor/file/column/ColumnValue";
import { z } from "zod";

export class Row extends AItemEntity {
  data: Record<string, ColumnValue> = {};
  description = "";

  constructor(init?: Partial<Row>) {
    super();
    Object.assign(this, init);
  }
}

export const rowSchema = z.object({
  ...aItemEntitySchema.shape,
  ...descriptionSchema.shape,
  data: z.record(z.string(), columnValueSchema),
}) satisfies z.ZodType<ToData<Row>>;
