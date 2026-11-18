import { trpcRouter } from "#server/trpc/routers/index";
import type { Context } from "#server/trpc/context";
import type { LiveTopicCalls } from "#server/trpc/routers/liveTopicCoverage.test";

import { createCallerFactory } from "#server/trpc/index";
import { createFriendship } from "#server/trpc/routers/createFriendship.test";

// The friend router's cases for the app-wide live topic check: the list reads the viewer's friends, and a deletion
// Removes one of them
export const createFriendLiveTopicCalls = async (context: Context): Promise<LiveTopicCalls> => {
  const { user } = await createFriendship(context);
  return {
    queries: [
      {
        call: (callContext) => createCallerFactory(trpcRouter)(callContext).friend.readFriends(),
        path: "friend.readFriends",
      },
    ],
    writes: [
      {
        call: (callContext) => createCallerFactory(trpcRouter)(callContext).friend.deleteFriend(user.id),
        path: "friend.deleteFriend",
      },
    ],
  };
};
