import type { AzureUpdateEntity } from "#shared/models/azure/AzureUpdateEntity";
import type { MessageEntity } from "#shared/models/db/message/MessageEntity";
import type { CustomTableClient } from "@@/server/models/azure/table/CustomTableClient";

import { updateEntity } from "@@/server/services/azure/table/updateEntity";
import { addMessageMetadata } from "@@/server/services/message/addMessageMetadata";
import { Operation } from "@esposter/shared";

export const updateMessage = (
  tableClient: CustomTableClient<MessageEntity>,
  entity: AzureUpdateEntity<MessageEntity>,
) => {
  addMessageMetadata(entity, Operation.Update);
  return updateEntity(tableClient, entity);
};
