import type { Clause } from "@esposter/db-schema";

import { MAX_READ_LIMIT } from "#shared/services/pagination/constants";
import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { router } from "@@/server/trpc";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { createEntity, deleteEntity, getTopNEntities, serializeClauses } from "@esposter/db";
import {
  AzureTable,
  BinaryOperator,
  BookmarkEntity,
  CompositeKeyPropertyNames,
  selectRoomInMessageSchema,
  standardMessageEntitySchema,
} from "@esposter/db-schema";
import { NotFoundError } from "@esposter/shared";
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
  cursor: z.string().optional(),
  limit: z.int().min(1).max(MAX_READ_LIMIT).default(50),
});
export type ReadBookmarksInput = z.infer<typeof readBookmarksInputSchema>;

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
      const entity = await bookmarkClient.getEntity<BookmarkEntity>(userId, rowKey).catch(() => null);
      if (!entity) throw new TRPCError({ code: "NOT_FOUND", message: new NotFoundError("Bookmark", rowKey).message });
      await deleteEntity(bookmarkClient, userId, rowKey);
    }),
  readBookmarks: standardAuthedProcedure.input(readBookmarksInputSchema).query(async ({ ctx, input: { limit } }) => {
    const userId = ctx.getSessionPayload.user.id;
    const bookmarkClient = await useTableClient(AzureTable.Bookmarks);
    const clauses: Clause<BookmarkEntity>[] = [
      { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: userId },
    ];
    return getTopNEntities(bookmarkClient, limit, BookmarkEntity, {
      filter: serializeClauses(clauses),
    });
  }),
});
