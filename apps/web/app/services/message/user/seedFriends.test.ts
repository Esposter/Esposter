import type { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import type { FriendInSocialWithRelations } from "@esposter/db-schema";

import { useFriendStore } from "#src/store/message/user/friend";
import { describe } from "vitest";

// Seeds the friend store the way the page reads its friends, so the store holds the friendships and their users as the
// Server sent them
export const seedFriends = async (
  trpcMsw: ReturnType<typeof setupMswTrpc>["trpcMsw"],
  friendships: FriendInSocialWithRelations[],
) => {
  const { $trpc } = useNuxtApp();
  trpcMsw.friend.readFriends.query(() => friendships);
  const friendStore = useFriendStore();
  const { readFriends } = friendStore;
  await readFriends(() => $trpc.friend.readFriends.query());
};

describe.todo("seedFriends");
