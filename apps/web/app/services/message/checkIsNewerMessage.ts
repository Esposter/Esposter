import type { ClientMessage } from "@/models/message/ClientMessage";

// A room's messages are ordered by when they were created, then by id, so two created in the same millisecond still
// Have one place in the order. The newest-first read and every cursor over it follow this same order
export const checkIsNewerMessage = (message: ClientMessage, comparedMessage: ClientMessage) => {
  const createdAtDifference = message.createdAt.getTime() - comparedMessage.createdAt.getTime();
  return createdAtDifference > 0 || (createdAtDifference === 0 && message.id > comparedMessage.id);
};
