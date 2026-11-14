import type { TableMapper } from "#src/models/cutover/TableMapper";

import { getReverseTickedMilliseconds } from "#src/services/cutover/tables/getReverseTickedMilliseconds";
import { messagesInMessage, MessageType, StreamTable } from "@esposter/db-schema";
import { getTableName } from "drizzle-orm";
import { z } from "zod";

// The legacy message as Azure holds it, read field by field. A file keeps every property it was written with, since its typed
// row stores the file whole
const legacyMessageSchema = z.object({
  appUser: z.looseObject({ id: z.string(), image: z.string().optional(), name: z.string().optional() }).optional(),
  files: z.array(z.looseObject({ filename: z.string(), id: z.string() })).optional(),
  isEdited: z.boolean().optional(),
  isForward: z.boolean().optional(),
  isPinned: z.boolean().optional(),
  linkPreviewResponse: z.unknown().optional(),
  mentions: z.array(z.string()).optional(),
  message: z.string().optional(),
  partitionKey: z.string(),
  replyRowKey: z.string().optional(),
  rowKey: z.string(),
  type: z.enum(MessageType),
  userId: z.string().optional(),
});

// The Messages table: one row per message. A room's messages and a member's are the parents they reference, and a reply names its
// root by the root's row key, so the reference is linked once every message is written
export const messageTableMapper: TableMapper = {
  azureTable: StreamTable.Messages,
  countByRoomSql: `SELECT "roomId" AS "partitionKey", COUNT(*) AS "count" FROM "${getTableName(messagesInMessage)}" GROUP BY "roomId"`,
  coreTable: getTableName(messagesInMessage),
  link: (entity, { idMap }) => {
    const { partitionKey: roomId, replyRowKey, rowKey } = legacyMessageSchema.parse(entity);
    if (!replyRowKey) return undefined;
    const id = idMap.get(StreamTable.Messages, roomId, rowKey);
    const referenceId = idMap.get(StreamTable.Messages, roomId, replyRowKey);
    // A root that is gone leaves its replies standing as plain messages, as the schema says
    if (id === undefined || referenceId === undefined) return undefined;
    return { column: "replyToId", id, referenceId };
  },
  map: (entity, { idMap, parents, timestamp }) => {
    const message = legacyMessageSchema.parse(entity);
    const roomId = message.partitionKey;
    if (!parents.roomIds.has(roomId)) return undefined;
    if (message.userId !== undefined && !parents.userIds.has(message.userId)) return undefined;
    const createdAt = getReverseTickedMilliseconds(message.rowKey);
    const { appUser } = message;
    const files = message.files ?? [];
    return {
      appUserId: appUser && parents.appUserIds.has(appUser.id) ? appUser.id : null,
      appUserImage: appUser?.image ?? "",
      createdAt,
      deletedAt: null,
      filenames: files.map(({ filename }) => filename).join(" "),
      files: JSON.stringify(files),
      id: idMap.assign(StreamTable.Messages, roomId, message.rowKey),
      isEdited: message.isEdited ? 1 : 0,
      isForward: message.isForward ? 1 : 0,
      isPinned: message.isPinned ? 1 : 0,
      linkPreviewResponse: message.linkPreviewResponse ? JSON.stringify(message.linkPreviewResponse) : null,
      mentions: JSON.stringify(message.mentions ?? []),
      message: message.message ?? "",
      replyToId: null,
      roomId,
      senderName: appUser?.name ?? null,
      type: message.type,
      updatedAt: timestamp?.getTime() ?? createdAt,
      userId: message.userId ?? null,
    };
  },
};
