import { trpcRouter } from "#server/trpc/routers/index";
import type { Context } from "#server/trpc/context";
import type { LiveTopicCalls } from "#server/trpc/routers/liveTopicCoverage.test";

import { createMockAuthSession, createMockUser, getMockSession } from "#server/trpc/context.test";
import { createCallerFactory } from "#server/trpc/index";
import { friendRequestRouter } from "#server/trpc/routers/friendRequest";

// The friend request router's cases for the app-wide live topic check: the list reads the requests the viewer sent and
// Received, and each accept, decline and send changes them
export const createFriendRequestLiveTopicCalls = async (context: Context): Promise<LiveTopicCalls> => {
  const userId = getMockSession().user.id;
  const acceptedSenderAuthSession = await createMockAuthSession(context.db);
  const declinedSenderAuthSession = await createMockAuthSession(context.db);
  const receiverUser = await createMockUser(context.db);
  await createCallerFactory(friendRequestRouter)({
    ...context,
    session: acceptedSenderAuthSession.session,
    user: acceptedSenderAuthSession.user,
  }).sendFriendRequest(userId);
  await createCallerFactory(friendRequestRouter)({
    ...context,
    session: declinedSenderAuthSession.session,
    user: declinedSenderAuthSession.user,
  }).sendFriendRequest(userId);
  return {
    queries: [
      {
        call: (callContext) => createCallerFactory(trpcRouter)(callContext).friendRequest.readFriendRequests(),
        path: "friendRequest.readFriendRequests",
      },
    ],
    writes: [
      {
        call: (callContext) =>
          createCallerFactory(trpcRouter)(callContext).friendRequest.acceptFriendRequest(
            acceptedSenderAuthSession.user.id,
          ),
        path: "friendRequest.acceptFriendRequest",
      },
      {
        call: (callContext) =>
          createCallerFactory(trpcRouter)(callContext).friendRequest.declineFriendRequest(
            declinedSenderAuthSession.user.id,
          ),
        path: "friendRequest.declineFriendRequest",
      },
      {
        call: (callContext) =>
          createCallerFactory(trpcRouter)(callContext).friendRequest.sendFriendRequest(receiverUser.id),
        path: "friendRequest.sendFriendRequest",
      },
    ],
  };
};
