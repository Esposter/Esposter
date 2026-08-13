import type { AzureUpdateEntity, CustomTableClient, MessageEntity } from "@esposter/db-schema";
import type { TupleSlice } from "@esposter/shared";

import { addMessageMetadata, updateEntity } from "@esposter/db";
import { Operation } from "@esposter/shared";

export const updateMessage = async (
  tableClient: CustomTableClient<MessageEntity>,
  entity: AzureUpdateEntity<MessageEntity>,
  // Mode and request options pass straight through, so a caller conditioning its write on the version it read
  // Reaches for this rather than dropping to updateEntity and losing the metadata stamp
  ...args: TupleSlice<Parameters<CustomTableClient<MessageEntity>["updateEntity"]>, 1>
) => {
  await addMessageMetadata(entity, Operation.Update);
  return updateEntity(tableClient, entity, ...args);
};
