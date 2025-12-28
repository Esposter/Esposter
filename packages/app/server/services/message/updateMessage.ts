import type { UpdateMode } from "@azure/data-tables";
import type { AzureUpdateEntity, CustomTableClient, MessageEntity } from "@esposter/db-schema";

import { addMessageMetadata, updateEntity } from "@esposter/db";
import { Operation } from "@esposter/shared";

export const updateMessage = async (
  tableClient: CustomTableClient<MessageEntity>,
  entity: AzureUpdateEntity<MessageEntity>,
  mode?: UpdateMode,
) => {
  await addMessageMetadata(entity, Operation.Update);
  return updateEntity(tableClient, entity, mode);
};
