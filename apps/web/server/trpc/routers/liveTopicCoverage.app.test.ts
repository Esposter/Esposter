import { createMockContext } from "#server/trpc/context.test";
import { createBlockLiveTopicCalls } from "#server/trpc/routers/blockLiveTopicCalls.test";
import { createBookmarkLiveTopicCalls } from "#server/trpc/routers/bookmarkLiveTopicCalls.test";
import { createFriendLiveTopicCalls } from "#server/trpc/routers/friendLiveTopicCalls.test";
import { createFriendRequestLiveTopicCalls } from "#server/trpc/routers/friendRequestLiveTopicCalls.test";
import { trpcRouter } from "#server/trpc/routers/index";
import { createInviteLiveTopicCalls } from "#server/trpc/routers/inviteLiveTopicCalls.test";
import { createLikeLiveTopicCalls } from "#server/trpc/routers/likeLiveTopicCalls.test";
import { expectLiveTopicCoverage } from "#server/trpc/routers/liveTopicCoverage.test";
import { createPostLiveTopicCalls } from "#server/trpc/routers/postLiveTopicCalls.test";
import { createCategoryLiveTopicCalls } from "#server/trpc/routers/room/categoryLiveTopicCalls.test";
import { createRoomLiveTopicCalls } from "#server/trpc/routers/room/liveTopicCalls.test";
import { createSearchHistoryLiveTopicCalls } from "#server/trpc/routers/searchHistoryLiveTopicCalls.test";
import { createWebhookLiveTopicCalls } from "#server/trpc/routers/webhookLiveTopicCalls.test";
import { describe, expect, test } from "vitest";

// Every migrated router's cases run together against the root router, so a write in one router is checked against the
// Reads of every other: the bookmark dock is woken by the room router's membership writes, as well as its own
describe("live topic coverage across the app", () => {
  test("every inferred query reads each table it touches, and each write wakes the reads it changes across routers", async () => {
    expect.hasAssertions();

    const context = await createMockContext();
    // The cases are built in this order, since each factory sets up its state on the context the one before left
    const calls = [
      createBookmarkLiveTopicCalls(),
      await createBlockLiveTopicCalls(context),
      await createFriendLiveTopicCalls(context),
      await createFriendRequestLiveTopicCalls(context),
      await createInviteLiveTopicCalls(context),
      await createPostLiveTopicCalls(context),
      await createLikeLiveTopicCalls(context),
      await createRoomLiveTopicCalls(context),
      await createWebhookLiveTopicCalls(context),
      await createSearchHistoryLiveTopicCalls(context),
      await createCategoryLiveTopicCalls(context),
    ];
    await expectLiveTopicCoverage(
      trpcRouter,
      { queries: calls.flatMap(({ queries }) => queries), writes: calls.flatMap(({ writes }) => writes) },
      context,
    );
  });
});
