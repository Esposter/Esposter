import { schema } from "#src/generated/schema";
import { defineRelationsPart } from "drizzle-orm";

export const messagesInMessageRelation = defineRelationsPart(schema, (r) => ({
  messagesInMessage: {
    appUser: r.one.appUsersInMessage({
      from: r.messagesInMessage.appUserId,
      optional: true,
      to: r.appUsersInMessage.id,
    }),
    emojis: r.many.messageEmojisInMessage({ from: r.messagesInMessage.id, to: r.messageEmojisInMessage.messageId }),
    replies: r.many.messagesInMessage({
      alias: "messagesInMessage_replyToId_messagesInMessage_id",
      from: r.messagesInMessage.id,
      to: r.messagesInMessage.replyToId,
    }),
    replyTo: r.one.messagesInMessage({
      alias: "messagesInMessage_replyToId_messagesInMessage_id",
      from: r.messagesInMessage.replyToId,
      optional: true,
      to: r.messagesInMessage.id,
    }),
    room: r.one.roomsInMessage({ from: r.messagesInMessage.roomId, optional: false, to: r.roomsInMessage.id }),
    user: r.one.usersInAuth({ from: r.messagesInMessage.userId, optional: true, to: r.usersInAuth.id }),
  },
  messageEmojisInMessage: {
    message: r.one.messagesInMessage({
      from: r.messageEmojisInMessage.messageId,
      optional: false,
      to: r.messagesInMessage.id,
    }),
  },
}));
