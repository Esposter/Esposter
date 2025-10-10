import type { UpdateMode } from "@azure/data-tables";
import type { AzureUpdateEntity, CustomTableClient, MessageEntity } from "@esposter/db-schema";

import { addMessageMetadata } from "@@/server/services/message/addMessageMetadata";
import { updateEntity } from "@esposter/db";
import { Operation } from "@esposter/shared";

export const updateMessage = (
  tableClient: CustomTableClient<MessageEntity>,
  entity: AzureUpdateEntity<MessageEntity>,
  mode?: UpdateMode,
) => {
  addMessageMetadata(entity, Operation.Update);
  return updateEntity(tableClient, entity, mode);
};
