import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { Clause } from "@esposter/db-schema";

import { createCursorPaginationParamsSchema } from "#shared/models/pagination/cursor/CursorPaginationParams";
import { MAX_READ_LIMIT, MESSAGE_ROWKEY_SORT_ITEM } from "#shared/services/pagination/constants";
import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { getCursorPaginationData } from "@@/server/services/pagination/cursor/getCursorPaginationData";
import { getCursorWhereAzureTable } from "@@/server/services/pagination/cursor/getCursorWhereAzureTable";
import { router } from "@@/server/trpc";
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
  AzureTable,
  BinaryOperator,
  BookmarkEntity,
  CompositeKeyPropertyNames,
  MessageEntityMap,
  MessageType,
  selectRoomInMessageSchema,
  standardMessageEntitySchema,
  StandardMessageEntity,
} from "@esposter/db-schema";
import { ID_SEPARATOR, ItemMetadataPropertyNames, NotFoundError } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
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
        rowKey: `${roomId}|${messageRowKey}`,
      });
      await createEntity(bookmarkClient, entity);
    }),
  deleteBookmark: standardAuthedProcedure
    .input(deleteBookmarkInputSchema)
    .mutation(async ({ ctx, input: { messageRowKey, roomId } }) => {
      const userId = ctx.getSessionPayload.user.id;
      const bookmarkClient = await useTableClient(AzureTable.Bookmarks);
      const rowKey = `${roomId}|${messageRowKey}`;
      const entity = await getEntity(bookmarkClient, BookmarkEntity, userId, rowKey);
      if (!entity) throw new TRPCError({ code: "NOT_FOUND", message: new NotFoundError("Bookmark", rowKey).message });
      await deleteEntity(bookmarkClient, userId, rowKey);
    }),
  readBookmarkMessages: standardAuthedProcedure
    .input(readBookmarkMessagesInputSchema)
    .query(async ({ ctx, input: { rowKeys } }) => {
      const messageClient = await useTableClient(AzureTable.Messages);
      const byRoom = new Map<string, string[]>();
      for (const bookmarkRowKey of rowKeys) {
        const sep = bookmarkRowKey.indexOf(ID_SEPARATOR);
        const roomId = bookmarkRowKey.slice(0, sep);
        const messageRowKey = bookmarkRowKey.slice(sep + 1);
        const existing = byRoom.get(roomId);
        if (existing) existing.push(messageRowKey);
        else byRoom.set(roomId, [messageRowKey]);
      }
      const messageArrays = await Promise.all(
        [...byRoom.entries()].map(([roomId, messageRowKeys]) => {
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
      const messageUsers =
        userIds.length > 0 ? await ctx.db.query.users.findMany({ where: { id: { in: userIds } } }) : [];
      return { messages, users: messageUsers };
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
