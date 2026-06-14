import type { relations, SearchHistoryInMessage } from "@esposter/db-schema";
import type { RelationsFilter } from "drizzle-orm";

import { createSearchHistoryInputSchema } from "#shared/models/db/searchHistory/CreateSearchHistoryInput";
import { deleteSearchHistoryInputSchema } from "#shared/models/db/searchHistory/DeleteSearchHistoryInput";
import { updateSearchHistoryInputSchema } from "#shared/models/db/searchHistory/UpdateSearchHistoryInput";
import { createCursorPaginationParamsSchema } from "#shared/models/pagination/cursor/CursorPaginationParams";
import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { getCursorPaginationData } from "@@/server/services/pagination/cursor/getCursorPaginationData";
import { getCursorWhere } from "@@/server/services/pagination/cursor/getCursorWhere";
import { parseSortByToSql } from "@@/server/services/pagination/sorting/parseSortByToSql";
import { router } from "@@/server/trpc";
import { requireMutation } from "@@/server/trpc/guards/requireMutation";
import { getMemberProcedure } from "@@/server/trpc/procedure/room/getMemberProcedure";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { DatabaseEntityType, searchHistoriesInMessage, selectSearchHistoryInMessageSchema } from "@esposter/db-schema";
import { ItemMetadataPropertyNames, Operation } from "@esposter/shared";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

const readSearchHistoriesInputSchema = z.object({
  ...createCursorPaginationParamsSchema(selectSearchHistoryInMessageSchema.keyof(), [
    { key: ItemMetadataPropertyNames.createdAt, order: SortOrder.Desc },
  ]).shape,
  roomId: selectSearchHistoryInMessageSchema.shape.roomId,
});

export const searchHistoryRouter = router({
  createSearchHistory: getMemberProcedure(createSearchHistoryInputSchema, "roomId").mutation<SearchHistoryInMessage>(
    async ({ ctx, input }) => {
      const newHistory = requireMutation(
        (
          await ctx.db
            .insert(searchHistoriesInMessage)
            .values({ ...input, userId: ctx.getSessionPayload.user.id })
            .returning()
        )[0],
        Operation.Create,
        DatabaseEntityType.SearchHistory,
        JSON.stringify(input),
      );
      return newHistory;
    },
  ),
  deleteSearchHistory: standardAuthedProcedure
    .input(deleteSearchHistoryInputSchema)
    .mutation<SearchHistoryInMessage>(async ({ ctx, input }) => {
      const deletedSearchHistory = requireMutation(
        (
          await ctx.db
            .delete(searchHistoriesInMessage)
            .where(
              and(
                eq(searchHistoriesInMessage.id, input),
                eq(searchHistoriesInMessage.userId, ctx.getSessionPayload.user.id),
              ),
            )
            .returning()
        )[0],
        Operation.Delete,
        DatabaseEntityType.SearchHistory,
        input,
      );
      return deletedSearchHistory;
    }),
  readSearchHistories: getMemberProcedure(readSearchHistoriesInputSchema, "roomId").query(
    async ({ ctx, input: { cursor, limit, roomId, sortBy } }) => {
      const where: RelationsFilter<(typeof relations)["searchHistoriesInMessage"], typeof relations> = {
        roomId: { eq: roomId },
      };
      if (cursor) where.RAW = (searchHistoriesInMessage) => getCursorWhere(searchHistoriesInMessage, cursor, sortBy);
      const resultSearchHistories = await ctx.db.query.searchHistoriesInMessage.findMany({
        limit: limit + 1,
        orderBy: (searchHistoriesInMessage) => parseSortByToSql(searchHistoriesInMessage, sortBy),
        where,
      });
      return getCursorPaginationData(resultSearchHistories, limit, sortBy);
    },
  ),
  updateSearchHistory: standardAuthedProcedure
    .input(updateSearchHistoryInputSchema)
    .mutation<SearchHistoryInMessage>(async ({ ctx, input: { id, query } }) => {
      const updatedSearchHistory = requireMutation(
        (
          await ctx.db
            .update(searchHistoriesInMessage)
            .set({ query })
            .where(
              and(
                eq(searchHistoriesInMessage.id, id),
                eq(searchHistoriesInMessage.userId, ctx.getSessionPayload.user.id),
              ),
            )
            .returning()
        )[0],
        Operation.Update,
        DatabaseEntityType.SearchHistory,
        id,
      );
      return updatedSearchHistory;
    }),
});
