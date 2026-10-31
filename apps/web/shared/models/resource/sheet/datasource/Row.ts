import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";
import type { ToData } from "@esposter/shared";

import { AItemEntity, aItemEntitySchema } from "#shared/models/entity/AItemEntity";
import { columnValueSchema } from "#shared/models/resource/sheet/column/ColumnValue";
import { MAX_RESOURCE_CONTENT_SIZE } from "#shared/services/resource/constants";
import { ITEM_NAME_MAX_LENGTH } from "#shared/services/resource/item/constants";
import { createRecordSchema } from "@esposter/shared";
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
  data: createRecordSchema(z.string().max(ITEM_NAME_MAX_LENGTH), columnValueSchema, MAX_RESOURCE_CONTENT_SIZE),
}) satisfies z.ZodType<ToData<Row>>;
