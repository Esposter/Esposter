import type { Page, SearchHistoryInMessage, Topic } from "@esposter/db-schema";
import type { User } from "better-auth";

import { ownedBy } from "#server/services/db/ownedBy";
import { router } from "#server/trpc";
import { requireMutation } from "#server/trpc/guards/requireMutation";
import { getTopicsProcedure } from "#server/trpc/procedure/getTopicsProcedure";
import { getMemberProcedure } from "#server/trpc/procedure/room/getMemberProcedure";
import { standardAuthedProcedure } from "#server/trpc/procedure/standardAuthedProcedure";
import { createSearchHistoryInputSchema } from "#shared/models/db/searchHistory/CreateSearchHistoryInput";
import { deleteSearchHistoryInputSchema } from "#shared/models/db/searchHistory/DeleteSearchHistoryInput";
import { readSearchHistoriesInputSchema } from "#shared/models/db/searchHistory/ReadSearchHistoriesInput";
import { updateSearchHistoryInputSchema } from "#shared/models/db/searchHistory/UpdateSearchHistoryInput";
import { SEARCH_HISTORY_PAGE_SORT } from "#shared/services/searchHistory/constants";
import { createPageSort, getPageOrderBy, getPageWhere, toPage } from "@esposter/db";
import { DatabaseEntityType, getTopic, searchHistoriesInMessage, TopicKind } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";
import { and, eq } from "drizzle-orm";

// A user's searches, across every room, are one topic: the history a room shows is read from it
const getSearchHistoryTopics = ({ ctx }: { ctx: { user: User } }): Topic[] => [
  getTopic(TopicKind.SearchHistory, ctx.user.id),
];

export const searchHistoryRouter = router({
  createSearchHistory: getTopicsProcedure(
    getMemberProcedure(createSearchHistoryInputSchema, "roomId"),
    getSearchHistoryTopics,
  ).mutation<SearchHistoryInMessage>(async ({ ctx, input }) => {
    const userId = ctx.user.id;
    // An identical search is recorded once, so running one again, from Enter or from the history, adds no second row
    const existingSearchHistory = await ctx.db.query.searchHistoriesInMessage.findFirst({
      where: {
        filters: { eq: input.filters ?? [] },
        query: { eq: input.query },
        roomId: { eq: input.roomId },
        userId: { eq: userId },
      },
    });
    if (existingSearchHistory) return existingSearchHistory;

    return requireMutation(
      (
        await ctx.db
          .insert(searchHistoriesInMessage)
          .values({ ...input, userId })
          .returning()
      )[0],
      Operation.Create,
      DatabaseEntityType.SearchHistory,
      JSON.stringify(input),
    );
  }),
  deleteSearchHistory: getTopicsProcedure(
    standardAuthedProcedure.input(deleteSearchHistoryInputSchema),
    getSearchHistoryTopics,
  ).mutation<SearchHistoryInMessage>(async ({ ctx, input }) =>
    requireMutation(
      (
        await ctx.db
          .delete(searchHistoriesInMessage)
          .where(ownedBy(searchHistoriesInMessage, input, ctx.user.id))
          .returning()
      )[0],
      Operation.Delete,
      DatabaseEntityType.SearchHistory,
      input,
    ),
  ),
  // A search history is the caller's own, exactly as `ownedBy` scopes every write to it — membership only says which
  // Room's searches may be read, never whose
  readSearchHistories: getTopicsProcedure(
    getMemberProcedure(readSearchHistoriesInputSchema, "roomId"),
    getSearchHistoryTopics,
  ).query<Page<SearchHistoryInMessage>>(async ({ ctx, input: { cursor, limit, roomId } }) => {
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
  }),
  updateSearchHistory: getTopicsProcedure(
    standardAuthedProcedure.input(updateSearchHistoryInputSchema),
    getSearchHistoryTopics,
  ).mutation<SearchHistoryInMessage>(async ({ ctx, input: { id, query } }) =>
    requireMutation(
      (
        await ctx.db
          .update(searchHistoriesInMessage)
          .set({ query })
          .where(ownedBy(searchHistoriesInMessage, id, ctx.user.id))
          .returning()
      )[0],
      Operation.Update,
      DatabaseEntityType.SearchHistory,
      id,
    ),
  ),
});
