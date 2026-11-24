import type { SentMessageWithRoom } from "#shared/models/db/message/SentMessageWithRoom";
import type { Page } from "@esposter/db-schema";

// A page of the caller's sent messages.
// Its cursor continues from the last entry the sender's index named, whether or not that entry's message survived.
// So a page whose every message is gone still names where the next one starts
export type ReadMySentMessagesResult = Page<SentMessageWithRoom>;
