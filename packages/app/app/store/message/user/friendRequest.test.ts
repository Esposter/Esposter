// @vitest-environment nuxt
import type { FriendRequestWithRelations, User } from "@esposter/db-schema";

import { createUser } from "@/services/message/user/createUser.test";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useAlertStore } from "@/store/alert";
import { useFriendStore } from "@/store/message/user/friend";
import { useFriendRequestStore } from "@/store/message/user/friendRequest";
import { TRPCError } from "@trpc/server";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
// AuthClient is a better-auth dynamic-path Proxy, so useSession is not a configurable own property and cannot be
// Spied on directly — mock the module and drive useSession through a hoisted mock instead. The store reads only
// session.value.data.user.id, so the mock returns just that slice of the session ref.
interface MockSessionValue {
  data?: { user: { id: string } };
}
const { useSessionMock } = vi.hoisted(() => ({ useSessionMock: vi.fn<() => Ref<MockSessionValue>>() }));

vi.mock(import("@/services/auth/authClient"), () => ({
  authClient: { useSession: useSessionMock } as unknown as (typeof import("@/services/auth/authClient"))["authClient"],
}));

describe(useFriendRequestStore, () => {
  const server = setupMswTrpc();
  const appUser = createUser({ name: "appUser" });
  const first = createUser({ name: "first" });
  const second = createUser({ name: "second" });
  const createFriendRequest = (sender: User): FriendRequestWithRelations => ({
    createdAt: new Date(0),
    deletedAt: null,
    id: `${sender.id}-${appUser.id}`,
    receiver: appUser,
    receiverId: appUser.id,
    sender,
    senderId: sender.id,
    updatedAt: new Date(0),
  });
  const firstFriendRequest = createFriendRequest(first);
  const secondFriendRequest = createFriendRequest(second);

  beforeEach(() => {
    setActivePinia(createPinia());
    useSessionMock.mockReturnValue(ref<MockSessionValue>({ data: undefined }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // The list only ever holds requests the app user is a party to, so the other party identifies the pair on its
  // Own. Naming the app user as well would make the removal silently do nothing whenever the session ref has not
  // Resolved yet — the request stays on screen after the user answered it, until a reload
  test("accepts a request without waiting on the session", () => {
    expect.hasAssertions();

    const friendStore = useFriendStore();
    const { friends } = storeToRefs(friendStore);
    const friendRequestStore = useFriendRequestStore();
    const { friendRequests } = storeToRefs(friendRequestStore);
    const { storeAcceptFriendRequest } = friendRequestStore;
    friendRequests.value = [firstFriendRequest, secondFriendRequest];
    storeAcceptFriendRequest(first);

    expect(friendRequests.value).toStrictEqual([secondFriendRequest]);
    expect(friends.value).toStrictEqual([first]);
  });

  test("declines a request without waiting on the session", () => {
    expect.hasAssertions();

    const friendRequestStore = useFriendRequestStore();
    const { friendRequests } = storeToRefs(friendRequestStore);
    const { storeDeclineFriendRequest } = friendRequestStore;
    friendRequests.value = [firstFriendRequest, secondFriendRequest];
    storeDeclineFriendRequest(first.id);

    expect(friendRequests.value).toStrictEqual([secondFriendRequest]);
  });

  // Each sender is its own target, so two answers overlap on one list. The failing one has to unwind to the list
  // The answer ahead of it left, not to the one the user was looking at when they clicked — restoring that would
  // Put back a request the server has already resolved
  test("rolls a failed decline back to the list the decline ahead of it left", async () => {
    expect.hasAssertions();

    server.use(
      trpcMsw.friendRequest.declineFriendRequest.mutation(({ input: senderId }) => {
        if (senderId === second.id) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });
      }),
    );
    const alertStore = useAlertStore();
    const friendRequestStore = useFriendRequestStore();
    const { friendRequests } = storeToRefs(friendRequestStore);
    const { declineFriendRequest } = friendRequestStore;
    friendRequests.value = [firstFriendRequest, secondFriendRequest];
    await Promise.all([declineFriendRequest(first.id), declineFriendRequest(second.id)]);

    expect(friendRequests.value).toStrictEqual([secondFriendRequest]);
    expect(alertStore.alerts).toHaveLength(1);
  });
});
