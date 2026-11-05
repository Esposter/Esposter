import type { MessageEntity } from "@esposter/db-schema";

import { CompositeKeyPropertyNames, serializeKey } from "@esposter/azure";

// The key every search document is stored under. The index is fed from the Table, whose key is `RowKey`, while the
// Document model spells it `rowKey`, so the service matches on the serialized name. That name is not a property of the
// Model, so it is typed as the model's key here, once, and the search calls that take a key use it as it is
export const SEARCH_KEY_NAME: keyof MessageEntity = serializeKey(
  CompositeKeyPropertyNames.rowKey,
) as keyof MessageEntity;
