import type { ClientMessage } from "@/models/message/ClientMessage";

// The room's newest message the page has been given by the room itself, which is what a reconnect replays after. An
// optimistic bubble has no id the room has assigned yet, so it is not a message the room has to replay from
export const getNewestMessageId = (messages: readonly ClientMessage[]) => {
  const messageIds = messages.filter(({ isLoading }) => !isLoading).map(({ id }) => id);
  return messageIds.length > 0 ? Math.max(...messageIds) : undefined;
};
