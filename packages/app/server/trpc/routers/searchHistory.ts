import type { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import type { relations, SearchHistoryInMessage } from "@esposter/db-schema";
import type { RelationsFilter } from "drizzle-orm";

import { createSearchHistoryInputSchema } from "#shared/models/db/searchHistory/CreateSearchHistoryInput";
import { deleteSearchHistoryInputSchema } from "#shared/models/db/searchHistory/DeleteSearchHistoryInput";
import { updateSearchHistoryInputSchema } from "#shared/models/db/searchHistory/UpdateSearchHistoryInput";
import { createCursorPaginationParamsSchema } from "#shared/models/pagination/cursor/CursorPaginationParams";
import { CREATED_AT_DESCENDING_SORT_ITEM } from "#shared/services/pagination/constants";
import { ownedBy } from "@@/server/services/db/ownedBy";
import { getCursorPaginationData } from "@@/server/services/pagination/cursor/getCursorPaginationData";
import { getCursorWhere } from "@@/server/services/pagination/cursor/getCursorWhere";
import { parseSortByToSql } from "@@/server/services/pagination/sorting/parseSortByToSql";
import { router } from "@@/server/trpc";
import { requireMutation } from "@@/server/trpc/guards/requireMutation";
import { getMemberProcedure } from "@@/server/trpc/procedure/room/getMemberProcedure";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { DatabaseEntityType, searchHistoriesInMessage, selectSearchHistoryInMessageSchema } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";
import { z } from "zod";

const readSearchHistoriesInputSchema = z.object({
  ...createCursorPaginationParamsSchema(selectSearchHistoryInMessageSchema.keyof(), [CREATED_AT_DESCENDING_SORT_ITEM])
    .shape,
  roomId: selectSearchHistoryInMessageSchema.shape.roomId,
});

export const searchHistoryRouter = router({
  createSearchHistory: getMemberProcedure(createSearchHistoryInputSchema, "roomId").mutation<SearchHistoryInMessage>(
    async ({ ctx, input }) => {
      const newSearchHistory = requireMutation(
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
      return newSearchHistory;
    },
  ),
  deleteSearchHistory: standardAuthedProcedure
    .input(deleteSearchHistoryInputSchema)
    .mutation<SearchHistoryInMessage>(async ({ ctx, input }) => {
      const deletedSearchHistory = requireMutation(
        (
          await ctx.db
            .delete(searchHistoriesInMessage)
            .where(ownedBy(searchHistoriesInMessage, input, ctx.getSessionPayload.user.id))
            .returning()
        )[0],
        Operation.Delete,
        DatabaseEntityType.SearchHistory,
        input,
      );
      return deletedSearchHistory;
    }),
  readSearchHistories: getMemberProcedure(readSearchHistoriesInputSchema, "roomId").query<
    CursorPaginationData<SearchHistoryInMessage>
  >(async ({ ctx, input: { cursor, limit, roomId, sortBy } }) => {
    // A search history is the caller's own, exactly as `ownedBy` scopes every write to it — membership only
    // Says which room's searches may be read, never whose
    const where: RelationsFilter<(typeof relations)["searchHistoriesInMessage"], typeof relations> = {
      roomId: { eq: roomId },
      userId: { eq: ctx.getSessionPayload.user.id },
    };
    if (cursor) where.RAW = (searchHistory) => getCursorWhere(searchHistory, cursor, sortBy);
    const resultSearchHistories = await ctx.db.query.searchHistoriesInMessage.findMany({
      limit: limit + 1,
      orderBy: (searchHistory) => parseSortByToSql(searchHistory, sortBy),
      where,
    });
    return getCursorPaginationData(resultSearchHistories, limit, sortBy);
  }),
  updateSearchHistory: standardAuthedProcedure
    .input(updateSearchHistoryInputSchema)
    .mutation<SearchHistoryInMessage>(async ({ ctx, input: { id, query } }) => {
      const updatedSearchHistory = requireMutation(
        (
          await ctx.db
            .update(searchHistoriesInMessage)
            .set({ query })
            .where(ownedBy(searchHistoriesInMessage, id, ctx.getSessionPayload.user.id))
            .returning()
        )[0],
        Operation.Update,
        DatabaseEntityType.SearchHistory,
        id,
      );
      return updatedSearchHistory;
    }),
});
