import type { IdMap } from "#src/models/cutover/IdMap";
import type { LegacyMessage } from "#src/models/cutover/LegacyMessage";
import type { LegacyMessageEmoji } from "#src/models/cutover/LegacyMessageEmoji";
import type { TableParents } from "#src/models/cutover/TableParents";
import type { RoomImport } from "@esposter/db-schema";

import { getReverseTickedMilliseconds } from "#src/services/cutover/tables/getReverseTickedMilliseconds";
import { fileEntitySchema } from "@esposter/db-schema";
import { z } from "zod";

export interface RoomImportSource {
  emojis: LegacyMessageEmoji[];
  // The number a message was given in its room, by its row key, or undefined when it has none
  getNumber: (rowKey: string) => number | undefined;
  idMap: Pick<IdMap, "rewrite">;
  messages: { message: LegacyMessage; timestamp: Date | undefined }[];
  parents: TableParents;
  scheduledMessages: RoomImport["scheduledMessages"];
}

// A room's messages, reactions and pending scheduled messages as the room object imports them. A message is written under the number
// its row key was given, and a reply, a reaction or a scheduled reply names its message by that number. A reply whose root was never
// numbered is a plain message, as the schema says. A message whose sender is gone keeps its row with no author, as the schema has it, so
// the replies to it keep their root
export const buildRoomImport = ({
  emojis,
  getNumber,
  idMap,
  messages,
  parents,
  scheduledMessages,
}: RoomImportSource): RoomImport => ({
  messages: messages.flatMap(({ message, timestamp }) => {
    const id = getNumber(message.rowKey);
    if (id === undefined) return [];

    const sender = message.userId === undefined ? null : idMap.rewrite(message.userId);
    const userId = sender !== null && parents.userIds.has(sender) ? sender : null;

    const createdAt = new Date(getReverseTickedMilliseconds(message.rowKey));
    const { appUser } = message;
    const appUserId = appUser ? idMap.rewrite(appUser.id) : null;
    return [
      {
        appUserId: appUserId && parents.appUserIds.has(appUserId) ? appUserId : null,
        appUserImage: appUser?.image ?? "",
        createdAt,
        files: z.array(fileEntitySchema).parse(message.files ?? []),
        id,
        isEdited: message.isEdited ?? false,
        isForward: message.isForward ?? false,
        isPinned: message.isPinned ?? false,
        linkPreviewResponse: message.linkPreviewResponse ?? null,
        mentions: (message.mentions ?? []).map((mention) => idMap.rewrite(mention)),
        message: idMap.rewrite(message.message ?? ""),
        replyToId: message.replyRowKey === undefined ? null : (getNumber(message.replyRowKey) ?? null),
        senderName: appUser?.name ?? null,
        type: message.type,
        updatedAt: timestamp ?? createdAt,
        userId,
      },
    ];
  }),
  reactions: emojis.flatMap(({ emojiTag, messageRowKey, userIds }) => {
    const messageId = getNumber(messageRowKey);
    return messageId === undefined
      ? []
      : [{ emojiTag, messageId, userIds: (userIds ?? []).map((userId) => idMap.rewrite(userId)) }];
  }),
  scheduledMessages,
});
