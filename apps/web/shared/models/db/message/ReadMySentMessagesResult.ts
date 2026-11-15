import type { SentMessageWithRoom } from "#shared/models/db/message/SentMessageWithRoom";
import type { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";

// A page of the caller's sent messages, its cursor the last entry the sender's index named rather than the last message
// That survived, so a page whose every message is gone still names where the next one starts
export type ReadMySentMessagesResult = CursorPaginationData<SentMessageWithRoom>;
