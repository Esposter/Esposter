import type { SentMessageWithRoom } from "#shared/models/db/message/SentMessageWithRoom";

export interface ReadMySentMessagesResult {
  hasMore: boolean;
  items: SentMessageWithRoom[];
}
