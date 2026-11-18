import { trpcRouter } from "#server/trpc/routers/index";
import type { Context } from "#server/trpc/context";
import type { LiveTopicCalls } from "#server/trpc/routers/liveTopicCoverage.test";

import { createMockUser } from "#server/trpc/context.test";
import { createCallerFactory } from "#server/trpc/index";

// The block router's cases for the app-wide live topic check: the list reads the users the viewer blocked, and a block
// Or an unblock changes them
export const createBlockLiveTopicCalls = async (context: Context): Promise<LiveTopicCalls> => {
  const user = await createMockUser(context.db);
  return {
    queries: [
      {
        call: (callContext) => createCallerFactory(trpcRouter)(callContext).block.readBlockedUsers(),
        path: "block.readBlockedUsers",
      },
    ],
    writes: [
      {
        call: (callContext) => createCallerFactory(trpcRouter)(callContext).block.createBlock(user.id),
        path: "block.createBlock",
      },
      {
        call: (callContext) => createCallerFactory(trpcRouter)(callContext).block.deleteBlock(user.id),
        path: "block.deleteBlock",
      },
    ],
  };
};
