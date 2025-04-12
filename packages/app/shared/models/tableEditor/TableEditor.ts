import type { ToData } from "#shared/models/entity/ToData";
import type { Item } from "#shared/models/tableEditor/Item";

import { AItemEntity, aItemEntitySchema } from "#shared/models/entity/AItemEntity";
import { TABLE_EDITOR_ITEMS_MAX_LENGTH } from "#shared/services/tableEditor/constants";
import { type } from "arktype";

export class TableEditor<T extends ToData<Item>> extends AItemEntity {
  items: T[] = [];
}

export const createTableEditorSchema = <T extends ToData<Item>>(schema: type.Any<T>) =>
  aItemEntitySchema.merge(type({ items: schema.array().atMostLength(TABLE_EDITOR_ITEMS_MAX_LENGTH) }));
