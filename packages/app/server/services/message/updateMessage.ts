import type { AzureUpdateEntity } from "#shared/models/azure/table/AzureUpdateEntity";
import type { CustomTableClient } from "@@/server/models/azure/table/CustomTableClient";
import type { UpdateMode } from "@azure/data-tables";
import type { MessageEntity } from "@esposter/db";

import { updateEntity } from "@@/server/services/azure/table/updateEntity";
import { addMessageMetadata } from "@@/server/services/message/addMessageMetadata";
import { Operation } from "@esposter/shared";

export const updateMessage = (
  tableClient: CustomTableClient<MessageEntity>,
  entity: AzureUpdateEntity<MessageEntity>,
  mode?: UpdateMode,
) => {
  addMessageMetadata(entity, Operation.Update);
  return updateEntity(tableClient, entity, mode);
};
