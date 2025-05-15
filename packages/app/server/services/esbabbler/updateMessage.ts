import type { AzureUpdateEntity } from "#shared/models/azure/AzureUpdateEntity";
import type { MessageEntity } from "#shared/models/db/message/MessageEntity";
import type { CustomTableClient } from "@@/server/models/azure/table/CustomTableClient";

import { updateEntity } from "@@/server/services/azure/table/updateEntity";

export const updateMessage = (
  tableClient: CustomTableClient<MessageEntity>,
  entity: AzureUpdateEntity<MessageEntity>,
) => {
  entity.isEdited = true;
  return updateEntity(tableClient, entity);
};
