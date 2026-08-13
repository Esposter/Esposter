import type { CreateMessageInput } from "@/models/message/CreateMessageInput";
import type { MessageEntityMap as MessageEntityMapType } from "@/models/message/MessageEntityMap";

import { MessageEntityMap } from "@/models/message/MessageEntityMap";
import { getReverseTickedTimestamp } from "@/services/azure/table/getReverseTickedTimestamp";
// Which class a message type instantiates is MessageEntityMap's answer, so it is read here rather than
// Re-decided, and the entity payload — the key the room id becomes, the timestamps every entity carries — is
// Stated once. The cast is what a union of constructors costs: each arm accepts only its own entity's Partial,
// So the map is asserted against the one init both are being handed
export const createMessageEntity = <T extends CreateMessageInput>(
  input: T,
): InstanceType<MessageEntityMapType[T["type"]]> => {
  const createdAt = new Date();
  const { roomId, ...rest } = input;
  const init = {
    ...rest,
    createdAt,
    partitionKey: roomId,
    rowKey: getReverseTickedTimestamp(),
    updatedAt: createdAt,
  };
  const MessageEntityClass = MessageEntityMap[input.type] as new (
    entityInit: typeof init,
  ) => InstanceType<MessageEntityMapType[T["type"]]>;
  return new MessageEntityClass(init);
};
