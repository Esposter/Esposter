import type { CreateMessageInput } from "#src/models/message/CreateMessageInput";

import { getReverseTickedTimestamp } from "#src/services/azure/table/getReverseTickedTimestamp";
import { MessageTypeEntityMap } from "#src/services/message/MessageTypeEntityMap";

// Which class a message type instantiates is MessageTypeEntityMap's answer, so it is read here rather than
// Re-decided, and the entity payload — the key the room id becomes, the timestamps every entity carries — is
// Stated once. The cast is what a union of constructors costs: each arm accepts only its own entity's Partial,
// So the map is asserted against the one init both are being handed
export const createMessageEntity = <T extends CreateMessageInput>(
  input: T,
): InstanceType<MessageTypeEntityMap[T["type"]]> => {
  const createdAt = new Date();
  const { roomId, ...rest } = input;
  // A field the writer leaves undefined takes the entity's own default: copied over it, the field would be stored
  // As no property at all
  const definedRest = Object.fromEntries(Object.entries(rest).filter(([, value]) => value !== undefined));
  const init = {
    ...definedRest,
    createdAt,
    partitionKey: roomId,
    rowKey: getReverseTickedTimestamp(),
    updatedAt: createdAt,
  };
  const MessageEntityClass = MessageTypeEntityMap[input.type] as new (
    entityInit: typeof init,
  ) => InstanceType<MessageTypeEntityMap[T["type"]]>;
  return new MessageEntityClass(init);
};
