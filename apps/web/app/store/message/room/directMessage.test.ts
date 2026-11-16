// @vitest-environment nuxt
import { useSession } from "#src/services/auth/authClient.test";
import { createOptimisticMessage } from "#src/services/message/createOptimisticMessage";
import { createRoom } from "#src/services/message/room/createRoom.test";
import { setCurrentRoomId } from "#src/services/message/room/setCurrentRoomId.test";
import { createUser } from "#src/services/message/user/createUser.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useAlertStore } from "#src/store/alert";
import { useDirectMessageStore } from "#src/store/message/room/directMessage";
import { getRouteParam } from "#src/util/router/getRouteParam";
import { MessageType, RoomType } from "@esposter/db-schema";
import { waitForSynchronizedFunctions } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(useDirectMessageStore, () => {
  const { trpcMsw } = setupMswTrpc();
  const roomId = v7();
  const first = createUser({ name: "first" });
  const second = createUser({ name: "second" });
  const third = createUser({ name: "third" });

  // Each participant is its own target, so removals overlap: the failing one is rolled back into a list the
  // Successful one has already shortened, and an index captured before that would put it back in the wrong place.
  test("restores a failed removal beside the participant that followed it", async () => {
    expect.hasAssertions();

    const { promise: isFirstDeleted, resolve: onFirstDeleted } = Promise.withResolvers<true>();
    const { promise: isSecondCalled, resolve: onSecondCalled } = Promise.withResolvers<true>();
    trpcMsw.room.directMessage.deleteDirectMessageParticipant.mutation(async ({ input: { userId } }) => {
      if (userId !== second.id) return first;
      onSecondCalled(true);
      await isFirstDeleted;
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const alertStore = useAlertStore();
    const directMessageStore = useDirectMessageStore();
    const { deleteDirectMessageParticipant, getDirectMessageParticipants, storeDirectMessageParticipants } =
      directMessageStore;
    storeDirectMessageParticipants(roomId, [first, second, third]);
    deleteDirectMessageParticipant(roomId, second.id);
    // A second call issued in the same tick would share the first one's batch and settle with it
    await isSecondCalled;
    deleteDirectMessageParticipant(roomId, first.id);
    await flushPromises();
    onFirstDeleted(true);
    await flushPromises();

    expect(getDirectMessageParticipants(roomId).map(({ id }) => id)).toStrictEqual([second.id, third.id]);
    expect(alertStore.alerts).toHaveLength(1);
  });

  test("removes a participant from the list on success", async () => {
    expect.hasAssertions();

    trpcMsw.room.directMessage.deleteDirectMessageParticipant.mutation(() => second);
    const alertStore = useAlertStore();
    const directMessageStore = useDirectMessageStore();
    const { deleteDirectMessageParticipant, getDirectMessageParticipants, storeDirectMessageParticipants } =
      directMessageStore;
    storeDirectMessageParticipants(roomId, [first, second, third]);
    deleteDirectMessageParticipant(roomId, second.id);
    await flushPromises();

    expect(getDirectMessageParticipants(roomId).map(({ id }) => id)).toStrictEqual([first.id, third.id]);
    expect(alertStore.alerts).toHaveLength(0);
  });

  // Each conversation is its own target, so hiding two in quick succession overlaps: the rejected one has to put
  // Back its own conversation only, or it un-hides the one the successful write already took off the list.
  // Held the same way as the removal above
  test("restores only the conversation whose hide was rejected", async () => {
    expect.hasAssertions();

    const firstDirectMessage = createRoom("", RoomType.DirectMessage);
    const secondDirectMessage = createRoom("", RoomType.DirectMessage);
    const { promise: isSecondHidden, resolve: onSecondHidden } = Promise.withResolvers<true>();
    const { promise: isFirstCalled, resolve: onFirstCalled } = Promise.withResolvers<true>();
    trpcMsw.room.directMessage.hideDirectMessage.mutation(async ({ input }) => {
      if (input !== firstDirectMessage.id) return;
      onFirstCalled(true);
      await isSecondHidden;
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const directMessageStore = useDirectMessageStore();
    const { hideDirectMessage, pushDirectMessages } = directMessageStore;
    const { directMessages } = storeToRefs(directMessageStore);
    pushDirectMessages(firstDirectMessage, secondDirectMessage);
    hideDirectMessage(firstDirectMessage.id);
    // Held the same way as the removal above
    await isFirstCalled;
    hideDirectMessage(secondDirectMessage.id);
    await flushPromises();
    onSecondHidden(true);
    await flushPromises();

    expect(directMessages.value).toStrictEqual([firstDirectMessage]);
  });

  // The invite is the reader's own message in the friend's direct message, created where none exists.
  // The reader stays where they are, so the send never navigates
  test("inviteFriend sends the link as the reader's message in a new direct message", async () => {
    expect.hasAssertions();

    const sender = createUser({ name: "sender" });
    useSession.mockReturnValue(ref({ data: { user: { id: sender.id } } }));
    const friendDirectMessage = createRoom("", RoomType.DirectMessage);
    const inviteLink = "https://esposter.test/messages/invite/abcd1234";
    const sentMessages: unknown[] = [];
    trpcMsw.room.directMessage.createDirectMessage.mutation(() => friendDirectMessage);
    trpcMsw.message.createMessage.mutation(({ input }) => {
      sentMessages.push(input);
      return createOptimisticMessage(
        { message: input.message, roomId: input.roomId, type: MessageType.Message },
        sender.id,
      );
    });
    const directMessageStore = useDirectMessageStore();
    const { directMessages } = storeToRefs(directMessageStore);
    const { inviteFriend } = directMessageStore;
    await inviteFriend(second.id, inviteLink);
    await flushPromises();

    expect(directMessages.value).toStrictEqual([friendDirectMessage]);
    expect(sentMessages).toStrictEqual([
      {
        files: [],
        message: inviteLink,
        replyToId: null,
        roomId: friendDirectMessage.id,
        timeZone: Temporal.Now.timeZoneId(),
        type: MessageType.Message,
      },
    ]);
  });

  // The reader is in the conversation the hide takes out of the list, so the refusal puts them back in it rather than
  // Leaving them in the conversation the hide navigated them to
  test("a refused hide brings the reader back to the conversation", async () => {
    expect.hasAssertions();

    // The route's auth middleware reads the session in the nuxt shape, so the reader is answered as signed in
    const session = { user: { id: v7() } };
    useSession.mockImplementation((fetcher) => (fetcher ? { data: ref(session) } : ref({ data: session })));
    const hiddenDirectMessage = createRoom("", RoomType.DirectMessage);
    const landingDirectMessage = createRoom("", RoomType.DirectMessage);
    // The navigation the hide starts is not held by the drain, since the room's page and middleware load on first use,
    // So the refusal waits until the reader has landed in the conversation the hide sent them to, as it does in the app
    const router = useRouter();
    const { promise: isInLanding, resolve: onInLanding } = Promise.withResolvers<true>();
    const removeLandingListener = router.afterEach((to) => {
      if (getRouteParam(to.params, "id") !== landingDirectMessage.id) return;
      removeLandingListener();
      onInLanding(true);
    });
    trpcMsw.room.directMessage.hideDirectMessage.mutation(async () => {
      await isInLanding;
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const directMessageStore = useDirectMessageStore();
    const { hideDirectMessage, pushDirectMessages } = directMessageStore;
    const { currentDirectMessage, currentDirectMessageId } = storeToRefs(directMessageStore);
    pushDirectMessages(hiddenDirectMessage, landingDirectMessage);
    setCurrentRoomId(hiddenDirectMessage.id);
    hideDirectMessage(hiddenDirectMessage.id);
    await waitForSynchronizedFunctions();
    // The refusal's rollback starts the navigation back as it lands, after the drain above took its snapshot
    await waitForSynchronizedFunctions();

    expect(currentDirectMessageId.value).toBe(hiddenDirectMessage.id);
    expect(currentDirectMessage.value).toStrictEqual(hiddenDirectMessage);
  });

  // A refusal can land before the navigation away has, while the reader still reads as in the conversation, and the
  // Navigation back is what cancels the one still on its way
  test("a hide refused before its navigation lands keeps the reader in the conversation", async () => {
    expect.hasAssertions();

    const session = { user: { id: v7() } };
    useSession.mockImplementation((fetcher) => (fetcher ? { data: ref(session) } : ref({ data: session })));
    const hiddenDirectMessage = createRoom("", RoomType.DirectMessage);
    const landingDirectMessage = createRoom("", RoomType.DirectMessage);
    trpcMsw.room.directMessage.hideDirectMessage.mutation(() => {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const directMessageStore = useDirectMessageStore();
    const { hideDirectMessage, pushDirectMessages } = directMessageStore;
    const { currentDirectMessageId } = storeToRefs(directMessageStore);
    pushDirectMessages(hiddenDirectMessage, landingDirectMessage);
    setCurrentRoomId(hiddenDirectMessage.id);
    hideDirectMessage(hiddenDirectMessage.id);
    await waitForSynchronizedFunctions();
    // The navigations the removal and its rollback start are drained once the write that started them has settled
    await waitForSynchronizedFunctions();

    expect(currentDirectMessageId.value).toBe(hiddenDirectMessage.id);
  });
});
