import type { MessageEntity, User } from "@esposter/db-schema";

// The one source of truth for the `isAuthor` half of MessageOperationPermission.Author, so the options menu and
// GetMessageProcedure can never disagree about who authored a message. Authorship is the message's own userId
// Whatever its type — a poll is a message its author posted no less than a text message is — and a webhook
// Message declares `userId?: undefined`, so an absent author is answered here rather than matching an absent
// Session at every call site.
export const getIsMessageAuthor = (message: Pick<MessageEntity, "userId">, userId: undefined | User["id"]) =>
  Boolean(message.userId) && message.userId === userId;
