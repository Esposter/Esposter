import type { CreateMessageInput } from "#shared/models/db/message/CreateMessageInput";

import { MessageEntity } from "#shared/models/db/message/MessageEntity";
import { getReverseTickedTimestamp } from "#shared/services/azure/table/getReverseTickedTimestamp";
import { getMessagesPartitionKey } from "@@/server/services/esbabbler/getMessagesPartitionKey";

export const createMessageEntity = ({
  roomId,
  ...rest
}: CreateMessageInput & Pick<MessageEntity, "isLoading" | "userId">) => {
  const createdAt = new Date();
  return new MessageEntity({
    ...rest,
    createdAt,
    partitionKey: getMessagesPartitionKey(roomId, createdAt),
    rowKey: getReverseTickedTimestamp(),
    updatedAt: createdAt,
  });
};
