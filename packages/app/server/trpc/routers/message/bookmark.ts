import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { Clause } from "@esposter/db-schema";

import { createCursorPaginationParamsSchema } from "#shared/models/pagination/cursor/CursorPaginationParams";
import { getBookmarkRowKey } from "#shared/services/message/getBookmarkRowKey";
import { MAX_READ_LIMIT, MESSAGE_ROWKEY_SORT_ITEM } from "#shared/services/pagination/constants";
import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { getCursorPaginationData } from "@@/server/services/pagination/cursor/getCursorPaginationData";
import { getCursorWhereAzureTable } from "@@/server/services/pagination/cursor/getCursorWhereAzureTable";
import { router } from "@@/server/trpc";
import { isMember } from "@@/server/trpc/middleware/userToRoom/isMember";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import {
  createEntity,
  deleteEntity,
  getEntity,
  getTableNullClause,
  getTopNEntities,
  getTopNEntitiesByType,
  serializeClauses,
} from "@esposter/db";
import {
  appUsersInMessage,
  AzureTable,
  BinaryOperator,
  BookmarkEntity,
  CompositeKeyPropertyNames,
  MessageEntityMap,
  MessageType,
  selectRoomInMessageSchema,
  StandardMessageEntity,
  standardMessageEntitySchema,
  WebhookMessageEntity,
} from "@esposter/db-schema";
import { ID_SEPARATOR, ItemMetadataPropertyNames, NotFoundError } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { getColumns, inArray } from "drizzle-orm";
import { z } from "zod";

const createBookmarkInputSchema = z.object({
  messageRowKey: standardMessageEntitySchema.shape.rowKey,
  roomId: selectRoomInMessageSchema.shape.id,
});
export type CreateBookmarkInput = z.infer<typeof createBookmarkInputSchema>;

const deleteBookmarkInputSchema = z.object({
  messageRowKey: standardMessageEntitySchema.shape.rowKey,
  roomId: selectRoomInMessageSchema.shape.id,
});
export type DeleteBookmarkInput = z.infer<typeof deleteBookmarkInputSchema>;

const readBookmarksInputSchema = z.object({
  ...createCursorPaginationParamsSchema(z.string(), []).omit({ sortBy: true }).shape,
});
export type ReadBookmarksInput = z.infer<typeof readBookmarksInputSchema>;

const readBookmarkMessagesInputSchema = z.object({
  rowKeys: z.string().array().min(1).max(MAX_READ_LIMIT),
});
export type ReadBookmarkMessagesInput = z.infer<typeof readBookmarkMessagesInputSchema>;

export const bookmarkRouter = router({
  createBookmark: standardAuthedProcedure
    .input(createBookmarkInputSchema)
    .mutation(async ({ ctx, input: { messageRowKey, roomId } }) => {
      const userId = ctx.getSessionPayload.user.id;
      const bookmarkClient = await useTableClient(AzureTable.Bookmarks);
      const entity = new BookmarkEntity({
        partitionKey: userId,
        rowKey: getBookmarkRowKey(roomId, messageRowKey),
      });
      await createEntity(bookmarkClient, entity);
    }),
  deleteBookmark: standardAuthedProcedure
    .input(deleteBookmarkInputSchema)
    .mutation(async ({ ctx, input: { messageRowKey, roomId } }) => {
      const userId = ctx.getSessionPayload.user.id;
      const bookmarkClient = await useTableClient(AzureTable.Bookmarks);
      const rowKey = getBookmarkRowKey(roomId, messageRowKey);
      const entity = await getEntity(bookmarkClient, BookmarkEntity, userId, rowKey);
      if (!entity) throw new TRPCError({ code: "NOT_FOUND", message: new NotFoundError("Bookmark", rowKey).message });
      await deleteEntity(bookmarkClient, userId, rowKey);
    }),
  readBookmarkMessages: standardAuthedProcedure
    .input(readBookmarkMessagesInputSchema)
    .query(async ({ ctx, input: { rowKeys } }) => {
      const userId = ctx.getSessionPayload.user.id;
      const bookmarkClient = await useTableClient(AzureTable.Bookmarks);
      const messageClient = await useTableClient(AzureTable.Messages);
      const uniqueRowKeys = [...new Set(rowKeys)];
      const bookmarkClauses: Clause<BookmarkEntity>[] = [
        { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: userId },
        ...uniqueRowKeys.map((rowKey) => ({
          key: CompositeKeyPropertyNames.rowKey,
          operator: BinaryOperator.eq,
          value: rowKey,
        })),
      ];
      const foundBookmarks = await getTopNEntities(bookmarkClient, uniqueRowKeys.length, BookmarkEntity, {
        filter: serializeClauses(bookmarkClauses),
      });
      const bookmarksByRowKey = new Map(foundBookmarks.map((bookmark) => [bookmark.rowKey, bookmark]));
      const bookmarks: BookmarkEntity[] = [];
      for (const rowKey of rowKeys) {
        const bookmark = bookmarksByRowKey.get(rowKey);
        if (!bookmark)
          throw new TRPCError({ code: "NOT_FOUND", message: new NotFoundError("Bookmark", rowKey).message });
        bookmarks.push(bookmark);
      }
      const messageRowKeysByRoomIdMap = new Map<string, string[]>();
      for (const bookmark of bookmarks) {
        const sep = bookmark.rowKey.indexOf(ID_SEPARATOR);
        const roomId = bookmark.rowKey.slice(0, sep);
        const messageRowKey = bookmark.rowKey.slice(sep + 1);
        const existingMessageRowKeys = messageRowKeysByRoomIdMap.get(roomId);
        if (existingMessageRowKeys) existingMessageRowKeys.push(messageRowKey);
        else messageRowKeysByRoomIdMap.set(roomId, [messageRowKey]);
      }
      await isMember(ctx.db, ctx.getSessionPayload, [...messageRowKeysByRoomIdMap.keys()]);
      const messageArrays = await Promise.all(
        [...messageRowKeysByRoomIdMap.entries()].map(([roomId, messageRowKeys]) => {
          const clauses: Clause<StandardMessageEntity>[] = [
            { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: roomId },
            getTableNullClause(ItemMetadataPropertyNames.deletedAt),
            ...messageRowKeys.map((rk) => ({
              key: CompositeKeyPropertyNames.rowKey,
              operator: BinaryOperator.eq,
              value: rk,
            })),
          ];
          return getTopNEntitiesByType(messageClient, messageRowKeys.length, MessageEntityMap, {
            filter: serializeClauses(clauses),
          });
        }),
      );
      const messages = messageArrays.flat();
      const userIds = [
        ...new Set(
          messages.filter((m): m is StandardMessageEntity => m.type !== MessageType.Webhook).map((m) => m.userId),
        ),
      ];
      const appUserIds = [
        ...new Set(
          messages.filter((m): m is WebhookMessageEntity => m.type === MessageType.Webhook).map((m) => m.appUser.id),
        ),
      ];
      const [messageUsers, messageAppUsers] = await Promise.all([
        userIds.length > 0 ? ctx.db.query.users.findMany({ where: { id: { in: userIds } } }) : [],
        appUserIds.length > 0
          ? ctx.db
              .select(getColumns(appUsersInMessage))
              .from(appUsersInMessage)
              .where(inArray(appUsersInMessage.id, appUserIds))
          : [],
      ]);
      return { appUsers: messageAppUsers, messages, users: messageUsers };
    }),
  readBookmarks: standardAuthedProcedure
    .input(readBookmarksInputSchema)
    .query(async ({ ctx, input: { cursor, limit } }) => {
      const userId = ctx.getSessionPayload.user.id;
      const bookmarkClient = await useTableClient(AzureTable.Bookmarks);
      const sortBy: SortItem<keyof BookmarkEntity>[] = [MESSAGE_ROWKEY_SORT_ITEM];
      const clauses: Clause<BookmarkEntity>[] = [
        { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: userId },
      ];
      if (cursor) clauses.push(...getCursorWhereAzureTable(cursor, sortBy));
      const bookmarks = await getTopNEntities(bookmarkClient, limit + 1, BookmarkEntity, {
        filter: serializeClauses(clauses),
      });
      return getCursorPaginationData(bookmarks, limit, sortBy);
    }),
});
