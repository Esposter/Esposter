// @vitest-environment nuxt
import { useSession } from "#src/services/auth/authClient.test";
import { createFriendRequest } from "#src/services/message/user/createFriendRequest.test";
import { createUser } from "#src/services/message/user/createUser.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useAlertStore } from "#src/store/alert";
import { useFriendStore } from "#src/store/message/user/friend";
import { useFriendRequestStore } from "#src/store/message/user/friendRequest";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

interface MockSessionValue {
  data?: undefined | { user: { id: string } };
}

describe(useFriendRequestStore, () => {
  const { trpcMsw } = setupMswTrpc();
  const appUser = createUser({ name: "appUser" });
  const first = createUser({ name: "first" });
  const second = createUser({ name: "second" });
  const firstFriendRequest = createFriendRequest(first, appUser);
  const secondFriendRequest = createFriendRequest(second, appUser);

  beforeEach(() => {
    useSession.mockReturnValue(ref<MockSessionValue>({ data: undefined }));
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

  // The read returns a request the other party already answered as a tombstone, so the overlay can remove it: a
  // Tombstone is no pending request on either side
  test("lists no answered request as pending", () => {
    expect.hasAssertions();

    useSession.mockReturnValue(ref<MockSessionValue>({ data: { user: { id: appUser.id } } }));
    const friendRequestStore = useFriendRequestStore();
    const { friendRequests, receivedFriendRequests } = storeToRefs(friendRequestStore);
    const { checkHasSentFriendRequest } = friendRequestStore;
    friendRequests.value = [
      { ...firstFriendRequest, deletedAt: new Date(0) },
      { ...firstFriendRequest, deletedAt: new Date(0), receiverId: second.id, sender: appUser, senderId: appUser.id },
    ];

    expect(receivedFriendRequests.value).toStrictEqual([]);
    expect(checkHasSentFriendRequest(second.id)).toBe(false);
  });

  // The predicate hides the add-friend affordance wherever a user is offered, so counting a request the app user
  // Received as one it sent would hide the button on exactly the person waiting to be added back
  test("counts only the requests the app user sent", () => {
    expect.hasAssertions();

    useSession.mockReturnValue(ref<MockSessionValue>({ data: { user: { id: appUser.id } } }));
    const friendRequestStore = useFriendRequestStore();
    const { friendRequests } = storeToRefs(friendRequestStore);
    const { checkHasSentFriendRequest } = friendRequestStore;
    friendRequests.value = [
      firstFriendRequest,
      { ...firstFriendRequest, receiverId: second.id, sender: appUser, senderId: appUser.id },
    ];

    expect(checkHasSentFriendRequest(second.id)).toBe(true);
    expect(checkHasSentFriendRequest(first.id)).toBe(false);
  });

  test("declines a request without waiting on the session", () => {
    expect.hasAssertions();

    const friendRequestStore = useFriendRequestStore();
    const { friendRequests } = storeToRefs(friendRequestStore);
    const { storeDeleteFriendRequestsByUser } = friendRequestStore;
    friendRequests.value = [firstFriendRequest, secondFriendRequest];
    storeDeleteFriendRequestsByUser(first.id);

    expect(friendRequests.value).toStrictEqual([secondFriendRequest]);
  });

  // Each sender is its own target, so two answers overlap on one list, and the failing one unwinds to the list the
  // Answer ahead of it left, whichever of the two was the one rejected
  test.each([first, second])("puts back only the request whose decline was rejected: $name", async (failedSender) => {
    expect.hasAssertions();

    trpcMsw.friendRequest.declineFriendRequest.mutation(({ input: senderId }) => {
      if (senderId === failedSender.id) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const alertStore = useAlertStore();
    const friendRequestStore = useFriendRequestStore();
    const { friendRequests } = storeToRefs(friendRequestStore);
    const { declineFriendRequest } = friendRequestStore;
    friendRequests.value = [firstFriendRequest, secondFriendRequest];
    declineFriendRequest(first.id);
    declineFriendRequest(second.id);
    await flushPromises();

    expect(friendRequests.value).toStrictEqual([createFriendRequest(failedSender, appUser)]);
    expect(alertStore.alerts).toHaveLength(1);
  });

  // An accept and a decline answer different senders, so neither queues behind the other while both write the
  // One list
  test("puts back only the request whose accept was rejected", async () => {
    expect.hasAssertions();

    trpcMsw.friendRequest.acceptFriendRequest.mutation(() => {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    trpcMsw.friendRequest.declineFriendRequest.mutation(() => {});
    const friendStore = useFriendStore();
    const { friends } = storeToRefs(friendStore);
    const friendRequestStore = useFriendRequestStore();
    const { friendRequests } = storeToRefs(friendRequestStore);
    const { acceptFriendRequest, declineFriendRequest } = friendRequestStore;
    friendRequests.value = [firstFriendRequest, secondFriendRequest];
    acceptFriendRequest(first);
    declineFriendRequest(second.id);
    await flushPromises();

    expect(friendRequests.value).toStrictEqual([firstFriendRequest]);
    expect(friends.value).toStrictEqual([]);
  });

  // An accept and a decline of one request end the same row, so the decline queues behind the accept. Run beside it, the
  // Decline found nothing left to remove, and the rejected accept's rollback put the request back after the decline had
  // Deleted it on the server
  test("a rejected accept does not bring back a request a decline removed", async () => {
    expect.hasAssertions();

    trpcMsw.friendRequest.acceptFriendRequest.mutation(() => {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    trpcMsw.friendRequest.declineFriendRequest.mutation(() => {});
    const friendRequestStore = useFriendRequestStore();
    const { friendRequests } = storeToRefs(friendRequestStore);
    const { acceptFriendRequest, declineFriendRequest } = friendRequestStore;
    friendRequests.value = [firstFriendRequest, secondFriendRequest];
    acceptFriendRequest(first);
    declineFriendRequest(first.id);
    await flushPromises();

    expect(friendRequests.value).toStrictEqual([secondFriendRequest]);
  });
});
