import type { StreamTable, StreamTableEntityMap, CreateMessageInput, MessageTypeEntityMap } from "@esposter/db-schema";
import type { StreamTableClient } from "#src/models/streams/StreamTableClient";

import { createEntity } from "#src/services/streams/createEntity";
import { addMessageMetadata } from "#src/services/message/addMessageMetadata";
import { createMessageEntity } from "@esposter/db-schema";

// One row is one message, so a single write lands it whole or not at all: a rejected write leaves nothing readable
export const createMessage = async <T extends CreateMessageInput>(
  messageClient: StreamTableClient<StreamTableEntityMap[StreamTable.Messages]>,
  input: T,
): Promise<InstanceType<MessageTypeEntityMap[T["type"]]>> => {
  const messageEntity = createMessageEntity(input);
  await addMessageMetadata(messageEntity);
  await createEntity(messageClient, messageEntity);
  return messageEntity;
};
