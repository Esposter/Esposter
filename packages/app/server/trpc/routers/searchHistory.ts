import type { SearchHistoryInMessage } from "@esposter/db-schema";
import type { SQL } from "drizzle-orm";

import { createSearchHistoryInputSchema } from "#shared/models/db/searchHistory/CreateSearchHistoryInput";
import { deleteSearchHistoryInputSchema } from "#shared/models/db/searchHistory/DeleteSearchHistoryInput";
import { updateSearchHistoryInputSchema } from "#shared/models/db/searchHistory/UpdateSearchHistoryInput";
import { createCursorPaginationParamsSchema } from "#shared/models/pagination/cursor/CursorPaginationParams";
import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { getCursorPaginationData } from "@@/server/services/pagination/cursor/getCursorPaginationData";
import { getCursorWhere } from "@@/server/services/pagination/cursor/getCursorWhere";
import { parseSortByToSql } from "@@/server/services/pagination/sorting/parseSortByToSql";
import { router } from "@@/server/trpc";
import { getMemberProcedure } from "@@/server/trpc/procedure/room/getMemberProcedure";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { DatabaseEntityType, searchHistoriesInMessage, selectSearchHistoryInMessageSchema } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

const readSearchHistoriesInputSchema = z.object({
  ...createCursorPaginationParamsSchema(selectSearchHistoryInMessageSchema.keyof(), [
    { key: "createdAt", order: SortOrder.Desc },
  ]).shape,
  roomId: selectSearchHistoryInMessageSchema.shape.roomId,
});
export type ReadSearchHistoriesInput = z.infer<typeof readSearchHistoriesInputSchema>;

export const searchHistoryRouter = router({
  createSearchHistory: getMemberProcedure(createSearchHistoryInputSchema, "roomId").mutation<SearchHistoryInMessage>(
    async ({ ctx, input }) => {
      const newHistory = (
        await ctx.db
          .insert(searchHistoriesInMessage)
          .values({ ...input, userId: ctx.session.user.id })
          .returning()
      ).find(Boolean);
      if (!newHistory)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(Operation.Create, DatabaseEntityType.SearchHistory, JSON.stringify(input))
            .message,
        });
      return newHistory;
    },
  ),
  deleteSearchHistory: standardAuthedProcedure
    .input(deleteSearchHistoryInputSchema)
    .mutation<SearchHistoryInMessage>(async ({ ctx, input }) => {
      const deletedSearchHistory = (
        await ctx.db
          .delete(searchHistoriesInMessage)
          .where(and(eq(searchHistoriesInMessage.id, input), eq(searchHistoriesInMessage.userId, ctx.session.user.id)))
          .returning()
      ).find(Boolean);
      if (!deletedSearchHistory)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(Operation.Delete, DatabaseEntityType.SearchHistory, input).message,
        });
      return deletedSearchHistory;
    }),
  readSearchHistories: getMemberProcedure(readSearchHistoriesInputSchema, "roomId").query(
    async ({ ctx, input: { cursor, limit, roomId, sortBy } }) => {
      const resultSearchHistories = await ctx.db.query.searchHistoriesInMessage.findMany({
        limit: limit + 1,
        orderBy: (searchHistoriesInMessage) => parseSortByToSql(searchHistoriesInMessage, sortBy),
        where: (searchHistoriesInMessage, { and, eq }) => {
          const wheres: (SQL | undefined)[] = [eq(searchHistoriesInMessage.roomId, roomId)];
          if (cursor) wheres.push(getCursorWhere(searchHistoriesInMessage, cursor, sortBy));
          return and(...wheres);
        },
      });
      return getCursorPaginationData(resultSearchHistories, limit, sortBy);
    },
  ),
  updateSearchHistory: standardAuthedProcedure
    .input(updateSearchHistoryInputSchema)
    .mutation<SearchHistoryInMessage>(async ({ ctx, input: { id, query } }) => {
      const updatedSearchHistory = (
        await ctx.db
          .update(searchHistoriesInMessage)
          .set({ query })
          .where(and(eq(searchHistoriesInMessage.id, id), eq(searchHistoriesInMessage.userId, ctx.session.user.id)))
          .returning()
      ).find(Boolean);
      if (!updatedSearchHistory)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(Operation.Update, DatabaseEntityType.SearchHistory, id).message,
        });
      return updatedSearchHistory;
    }),
});
