import type { Page, SearchHistoryInMessage } from "@esposter/db-schema";

import { requireMutation } from "#server/trpc/guards/requireMutation";
import { router } from "#server/trpc/index";
import { getMemberProcedure } from "#server/trpc/procedure/room/getMemberProcedure";
import { createSearchHistoryInputSchema } from "#shared/models/db/searchHistory/CreateSearchHistoryInput";
import { readSearchHistoriesInputSchema } from "#shared/models/db/searchHistory/ReadSearchHistoriesInput";
import { SEARCH_HISTORY_PAGE_SORT } from "#shared/services/searchHistory/constants";
import { createPageSort, getPageOrderBy, getPageWhere, toPage } from "@esposter/db";
import { DatabaseEntityType, searchHistoriesInMessage } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";
import { and, eq } from "drizzle-orm";

export const searchHistoryRouter = router({
  createSearchHistory: getMemberProcedure(createSearchHistoryInputSchema, "roomId").mutation<SearchHistoryInMessage>(
    async ({ ctx, input }) => {
      const userId = ctx.user.id;
      // An identical search is recorded once, so running one again, from Enter or from the history, adds no second row.
      // The unique index on a search's identity is what refuses the copy, and the conflict sets the row to the values
      // It already holds, so the insert hands back the row it met unchanged
      return requireMutation(
        (
          await ctx.db
            .insert(searchHistoriesInMessage)
            .values({ ...input, userId })
            .onConflictDoUpdate({
              set: { query: input.query },
              target: [
                searchHistoriesInMessage.userId,
                searchHistoriesInMessage.roomId,
                searchHistoriesInMessage.query,
                searchHistoriesInMessage.filters,
              ],
            })
            .returning()
        )[0],
        Operation.Create,
        DatabaseEntityType.SearchHistory,
        JSON.stringify(input),
      );
    },
  ),
  // A search history is the caller's own, and the read filters on the caller's id as the create stamps it — membership
  // Only says which Room's searches may be read, never whose
  readSearchHistories: getMemberProcedure(readSearchHistoriesInputSchema, "roomId").query<Page<SearchHistoryInMessage>>(
    async ({ ctx, input: { cursor, limit, roomId } }) => {
      const boundSort = createPageSort({ id: searchHistoriesInMessage.id }, SEARCH_HISTORY_PAGE_SORT);
      const rows = await ctx.db
        .select()
        .from(searchHistoriesInMessage)
        .where(
          and(
            eq(searchHistoriesInMessage.roomId, roomId),
            eq(searchHistoriesInMessage.userId, ctx.user.id),
            getPageWhere(boundSort, cursor),
          ),
        )
        .orderBy(...getPageOrderBy(boundSort, cursor))
        .limit(limit + 1);
      return toPage(rows, SEARCH_HISTORY_PAGE_SORT, cursor, limit);
    },
  ),
});
