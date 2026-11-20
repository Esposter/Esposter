// @vitest-environment nuxt
import type { FriendRequestInSocialWithRelations } from "@esposter/db-schema";

import { setupSession } from "#src/services/auth/setupSession.test";
import { createFriendRequest } from "#src/services/message/user/createFriendRequest.test";
import { createUser } from "#src/services/message/user/createUser.test";
import { friendRequestTable } from "#src/services/message/user/pair/constants";
import { appendRowVersions } from "#src/services/trpc/appendRowVersions.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useAlertStore } from "#src/store/alert";
import { useFriendStore } from "#src/store/message/user/friend";
import { useFriendRequestStore } from "#src/store/message/user/friendRequest";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(useFriendRequestStore, () => {
  const { trpcMsw } = setupMswTrpc();
  const appUser = createUser({ name: "appUser" });
  const first = createUser({ name: "first" });
  const second = createUser({ name: "second" });
  setupSession(appUser.id);
  const firstFriendRequest = createFriendRequest(first, appUser);
  const secondFriendRequest = createFriendRequest(second, appUser);
  const sentFriendRequest = createFriendRequest(appUser, second);
  const trpcError = new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
  const firstFriendRequestRowVersion = {
    key: { receiverId: appUser.id, senderId: first.id },
    table: friendRequestTable.name,
    version: 1,
  };

  const seedFriendRequests = async (friendRequests: FriendRequestInSocialWithRelations[]) => {
    const { $trpc } = useNuxtApp();
    trpcMsw.friendRequest.readFriendRequests.query(() => friendRequests);
    const friendRequestStore = useFriendRequestStore();
    const { readFriendRequests } = friendRequestStore;
    await readFriendRequests(() => $trpc.friendRequest.readFriendRequests.query());
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // The read returns a request the other party already answered as a tombstone, which is no request still pending
  test("lists no answered request as pending", async () => {
    expect.hasAssertions();

    const friendRequestStore = useFriendRequestStore();
    const { receivedFriendRequests } = storeToRefs(friendRequestStore);
    const { checkHasSentFriendRequest } = friendRequestStore;
    await seedFriendRequests([
      { ...firstFriendRequest, deletedAt: new Date(0), version: 1 },
      { ...sentFriendRequest, deletedAt: new Date(0), version: 1 },
    ]);

    expect(receivedFriendRequests.value).toStrictEqual([]);
    expect(checkHasSentFriendRequest(second.id)).toBe(false);
  });

  // The predicate hides the add-friend affordance wherever a user is offered, so counting a request the app user
  // Received as one it sent would hide the button on exactly the person waiting to be added back
  test("counts only the requests the app user sent", async () => {
    expect.hasAssertions();

    const friendRequestStore = useFriendRequestStore();
    const { checkHasSentFriendRequest } = friendRequestStore;
    await seedFriendRequests([firstFriendRequest, sentFriendRequest]);

    expect(checkHasSentFriendRequest(second.id)).toBe(true);
    expect(checkHasSentFriendRequest(first.id)).toBe(false);
  });

  // A send is awaited, so the button shows its pending state until the server's row lands, and the received list is
  // Unchanged by the app user's own send
  test("shows a send as pending until the server answers, then as a sent request", async () => {
    expect.hasAssertions();

    const { promise: sendAnswered, resolve: answerSend } = Promise.withResolvers<FriendRequestInSocialWithRelations>();
    trpcMsw.friendRequest.sendFriendRequest.mutation(() => sendAnswered);
    const friendRequestStore = useFriendRequestStore();
    const { checkHasSentFriendRequest, checkIsSendFriendRequestPending, sendFriendRequest } = friendRequestStore;
    const sent = sendFriendRequest(second.id);
    await flushPromises();

    expect(checkIsSendFriendRequestPending(second.id)).toBe(true);

    answerSend(sentFriendRequest);
    await sent;

    expect(checkIsSendFriendRequestPending(second.id)).toBe(false);
    expect(checkHasSentFriendRequest(second.id)).toBe(true);
  });

  test("declines a request without waiting for the answer", async () => {
    expect.hasAssertions();

    trpcMsw.friendRequest.declineFriendRequest.mutation(({ ctx, path }) => {
      appendRowVersions(ctx.responseHeaders, path, [firstFriendRequestRowVersion]);
    });
    const friendRequestStore = useFriendRequestStore();
    const { receivedFriendRequests } = storeToRefs(friendRequestStore);
    const { declineFriendRequest } = friendRequestStore;
    await seedFriendRequests([firstFriendRequest, secondFriendRequest]);
    declineFriendRequest(first.id);
    await flushPromises();

    expect(receivedFriendRequests.value.map(({ id }) => id)).toStrictEqual([secondFriendRequest.id]);
  });

  // Each sender is its own target, so two declines overlap on one list, and the failing one is the request that stays
  test.each([first, second])("keeps only the request whose decline was rejected: $name", async (failedSender) => {
    expect.hasAssertions();

    trpcMsw.friendRequest.declineFriendRequest.mutation(({ ctx, input: senderId, path }) => {
      if (senderId === failedSender.id) throw trpcError;

      appendRowVersions(ctx.responseHeaders, path, [
        { key: { receiverId: appUser.id, senderId }, table: friendRequestTable.name, version: 1 },
      ]);
    });
    const alertStore = useAlertStore();
    const friendRequestStore = useFriendRequestStore();
    const { receivedFriendRequests } = storeToRefs(friendRequestStore);
    const { declineFriendRequest } = friendRequestStore;
    await seedFriendRequests([firstFriendRequest, secondFriendRequest]);
    declineFriendRequest(first.id);
    declineFriendRequest(second.id);
    await flushPromises();

    expect(receivedFriendRequests.value).toStrictEqual([createFriendRequest(failedSender, appUser)]);
    expect(alertStore.alerts).toHaveLength(1);
  });

  // An accept and a decline answer different senders, so neither queues behind the other while both write the one list
  test("keeps the request whose accept was rejected, and removes the one another decline answered", async () => {
    expect.hasAssertions();

    trpcMsw.friendRequest.acceptFriendRequest.mutation(() => {
      throw trpcError;
    });
    trpcMsw.friendRequest.declineFriendRequest.mutation(({ ctx, path }) => {
      appendRowVersions(ctx.responseHeaders, path, [
        { key: { receiverId: appUser.id, senderId: second.id }, table: friendRequestTable.name, version: 1 },
      ]);
    });
    const friendStore = useFriendStore();
    const { friends } = storeToRefs(friendStore);
    const friendRequestStore = useFriendRequestStore();
    const { receivedFriendRequests } = storeToRefs(friendRequestStore);
    const { acceptFriendRequest, declineFriendRequest } = friendRequestStore;
    await seedFriendRequests([firstFriendRequest, secondFriendRequest]);
    acceptFriendRequest(first.id);
    declineFriendRequest(second.id);
    await flushPromises();

    expect(receivedFriendRequests.value.map(({ id }) => id)).toStrictEqual([firstFriendRequest.id]);
    expect(friends.value).toStrictEqual([]);
  });

  // An accept and a decline of one request end the same row, so the decline queues behind the accept. The accept's
  // Rejection drops its entry, and the decline's answer keeps the request off the list
  test("a rejected accept does not bring back a request a decline removed", async () => {
    expect.hasAssertions();

    trpcMsw.friendRequest.acceptFriendRequest.mutation(() => {
      throw trpcError;
    });
    trpcMsw.friendRequest.declineFriendRequest.mutation(({ ctx, path }) => {
      appendRowVersions(ctx.responseHeaders, path, [firstFriendRequestRowVersion]);
    });
    const friendRequestStore = useFriendRequestStore();
    const { receivedFriendRequests } = storeToRefs(friendRequestStore);
    const { acceptFriendRequest, declineFriendRequest } = friendRequestStore;
    await seedFriendRequests([firstFriendRequest, secondFriendRequest]);
    acceptFriendRequest(first.id);
    declineFriendRequest(first.id);
    await flushPromises();

    expect(receivedFriendRequests.value.map(({ id }) => id)).toStrictEqual([secondFriendRequest.id]);
  });
});
