import type { SearchHistory } from "@esposter/db-schema";

import { createSearchHistoryInputSchema } from "#shared/models/db/searchHistory/CreateSearchHistoryInput";
import { deleteSearchHistoryInputSchema } from "#shared/models/db/searchHistory/DeleteSearchHistoryInput";
import { updateSearchHistoryInputSchema } from "#shared/models/db/searchHistory/UpdateSearchHistoryInput";
import { createCursorPaginationParamsSchema } from "#shared/models/pagination/cursor/CursorPaginationParams";
import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { getCursorPaginationData } from "@@/server/services/pagination/cursor/getCursorPaginationData";
import { getCursorWhere } from "@@/server/services/pagination/cursor/getCursorWhere";
import { parseSortByToSql } from "@@/server/services/pagination/sorting/parseSortByToSql";
import { router } from "@@/server/trpc";
import { authedProcedure } from "@@/server/trpc/procedure/authedProcedure";
import { getMemberProcedure } from "@@/server/trpc/procedure/room/getMemberProcedure";
import { DatabaseEntityType, searchHistories, selectSearchHistorySchema } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { and, eq, SQL } from "drizzle-orm";
import { z } from "zod";

const readSearchHistoriesInputSchema = z.object({
  ...createCursorPaginationParamsSchema(selectSearchHistorySchema.keyof(), [
    { key: "createdAt", order: SortOrder.Desc },
  ]).shape,
  roomId: selectSearchHistorySchema.shape.roomId,
});
export type ReadSearchHistoriesInput = z.infer<typeof readSearchHistoriesInputSchema>;

export const searchHistoryRouter = router({
  createSearchHistory: getMemberProcedure(createSearchHistoryInputSchema, "roomId").mutation<SearchHistory>(
    async ({ ctx, input }) => {
      const newHistory = (
        await ctx.db
          .insert(searchHistories)
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
  deleteSearchHistory: authedProcedure
    .input(deleteSearchHistoryInputSchema)
    .mutation<SearchHistory>(async ({ ctx, input }) => {
      const deletedSearchHistory = (
        await ctx.db
          .delete(searchHistories)
          .where(and(eq(searchHistories.id, input), eq(searchHistories.userId, ctx.session.user.id)))
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
      const resultSearchHistories = await ctx.db.query.searchHistories.findMany({
        limit: limit + 1,
        orderBy: (searchHistories) => parseSortByToSql(searchHistories, sortBy),
        where: (searchHistories, { and, eq }) => {
          const wheres: (SQL | undefined)[] = [eq(searchHistories.roomId, roomId)];
          if (cursor) wheres.push(getCursorWhere(searchHistories, cursor, sortBy));
          return and(...wheres);
        },
      });
      return getCursorPaginationData(resultSearchHistories, limit, sortBy);
    },
  ),
  updateSearchHistory: authedProcedure
    .input(updateSearchHistoryInputSchema)
    .mutation<SearchHistory>(async ({ ctx, input: { id, query } }) => {
      const updatedSearchHistory = (
        await ctx.db
          .update(searchHistories)
          .set({ query })
          .where(and(eq(searchHistories.id, id), eq(searchHistories.userId, ctx.session.user.id)))
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
