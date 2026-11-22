// @vitest-environment nuxt
import type { DirectMessageParticipants } from "#shared/models/db/room/DirectMessageParticipants";
import type { PublicUser } from "@esposter/db-schema";

import { useRoomListEvents } from "#src/composables/message/events/useRoomListEvents";
import { useReadDirectMessages } from "#src/composables/message/room/useReadDirectMessages";
import { useSession } from "#src/services/auth/authClient.test";
import { createOptimisticMessage } from "#src/services/message/createOptimisticMessage";
import { createRoom } from "#src/services/message/room/createRoom.test";
import { createUserToRoom } from "#src/services/message/room/createUserToRoom.test";
import { createUser } from "#src/services/message/user/createUser.test";
import { readActiveTopicReads } from "#src/services/realtime/collectTopics";
import { getLastOpenRealtimeSocketCall } from "#src/services/realtime/openRealtimeSocket.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useAlertStore } from "#src/store/alert";
import { useDirectMessageStore } from "#src/store/message/room/directMessage";
import { useUserToRoomStore } from "#src/store/message/room/userToRoom";
import { useConnectionStore } from "#src/store/realtime/connection";
import { getRouteParam } from "#src/util/router/getRouteParam";
import { setRouteId } from "#src/util/router/setRouteId.test";
import { getScopeTopic, MessageType, RoomType, usersToRoomsInMessage } from "@esposter/db-schema";
import { waitForSynchronizedFunctions } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { getTableName } from "drizzle-orm";
import { v7 } from "uuid";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(
  import("#src/services/realtime/openRealtimeSocket"),
  () => import("#src/services/realtime/openRealtimeSocket.test"),
);

// A participant as a read answers them: the membership row a room's members read, with the user it belongs to
const participantsOf = (participantRoomId: string, users: PublicUser[], version = 0): DirectMessageParticipants[] => [
  {
    participants: users.map((user) => ({
      deletedAt: null,
      displayName: user.name,
      roomId: participantRoomId,
      user,
      userId: user.id,
      version,
    })),
    roomId: participantRoomId,
  },
];
const mockReaderSession = () => {
  const session = { user: { id: v7() } };
  useSession.mockImplementation((fetcher) => (fetcher ? { data: ref(session) } : ref({ data: session })));
  return session;
};

describe(useDirectMessageStore, () => {
  const { trpcMsw } = setupMswTrpc();
  const roomId = v7();
  const first = createUser({ name: "first" });
  const second = createUser({ name: "second" });
  const third = createUser({ name: "third" });
  const trpcError = new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
  beforeEach(() => {
    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // A removal is awaited, and the membership its answer tombstones takes the participant off the list
  test("takes a participant off the list when the removal's answer tombstones their membership", async () => {
    expect.hasAssertions();

    trpcMsw.room.directMessage.deleteDirectMessageParticipant.mutation(() => ({
      deletedAt: new Date(0),
      displayName: second.name,
      roomId,
      userId: second.id,
      version: 1,
    }));
    const alertStore = useAlertStore();
    const { alerts } = storeToRefs(alertStore);
    const directMessageStore = useDirectMessageStore();
    const { arriveDirectMessageParticipants, deleteDirectMessageParticipant, getDirectMessageParticipants } =
      directMessageStore;
    arriveDirectMessageParticipants(participantsOf(roomId, [first, second, third]));
    await deleteDirectMessageParticipant(roomId, second.id);

    expect(getDirectMessageParticipants(roomId).map(({ id }) => id)).toStrictEqual([first.id, third.id]);
    expect(alerts.value).toHaveLength(0);
  });

  // A refused removal leaves the membership as it was, so the participant stays in the conversation
  test("keeps a participant whose removal is refused, and shows the error", async () => {
    expect.hasAssertions();

    trpcMsw.room.directMessage.deleteDirectMessageParticipant.mutation(() => {
      throw trpcError;
    });
    const alertStore = useAlertStore();
    const { alerts } = storeToRefs(alertStore);
    const directMessageStore = useDirectMessageStore();
    const { arriveDirectMessageParticipants, deleteDirectMessageParticipant, getDirectMessageParticipants } =
      directMessageStore;
    arriveDirectMessageParticipants(participantsOf(roomId, [first, second, third]));
    await deleteDirectMessageParticipant(roomId, second.id);

    expect(getDirectMessageParticipants(roomId).map(({ id }) => id)).toStrictEqual([first.id, second.id, third.id]);
    expect(alerts.value).toHaveLength(1);
  });

  // A participant's row is a membership, so a removal is its tombstone arriving.
  // A read of the list answered before the removal still names that participant live, at the version the removal superseded.
  // So it must not put them back.
  test("a late participants read does not re-add a participant a removal has tombstoned", async () => {
    expect.hasAssertions();

    const directMessage = createRoom("", RoomType.DirectMessage);
    const { promise: lateReadAnswered, resolve: onLateReadAnswered } = Promise.withResolvers<true>();
    let directMessageReads = 0;
    trpcMsw.room.directMessage.readDirectMessages.query(async () => {
      directMessageReads++;
      // The first read holds both participants. The second is the late one, held until the removal has landed
      if (directMessageReads > 1) await lateReadAnswered;
      return {
        items: [directMessage],
        nextCursor: "",
        participants: participantsOf(directMessage.id, [first, second]),
      };
    });
    trpcMsw.userToRoom.readMyUsersToRooms.query(() => []);
    const connectionStore = useConnectionStore();
    const { openUser } = connectionStore;
    openUser();
    const [, onUserFrame] = getLastOpenRealtimeSocketCall();
    effectScope().run(() => {
      useRoomListEvents();
    });
    const directMessageStore = useDirectMessageStore();
    const { getDirectMessageParticipants } = directMessageStore;
    const { readDirectMessages } = useReadDirectMessages();
    await readDirectMessages();
    const lateRead = readDirectMessages();
    await flushPromises();
    onUserFrame?.(
      JSON.stringify({
        data: {
          deletedAt: new Date(0),
          displayName: second.name,
          roomId: directMessage.id,
          userId: second.id,
          version: 1,
        },
        type: "leaveRoom",
      }),
    );
    await flushPromises();
    onLateReadAnswered(true);
    await lateRead;
    await flushPromises();

    expect(directMessageReads).toBe(2);
    expect(getDirectMessageParticipants(directMessage.id).map(({ id }) => id)).toStrictEqual([first.id]);
  });

  // The hide is an entry over the viewer's membership, so the conversation leaves the list while the write is out.
  // A refusal drops that entry, and the conversation is visible as it was.
  test("a refused hide leaves the direct message visible", async () => {
    expect.hasAssertions();

    const session = mockReaderSession();
    const directMessage = createRoom("", RoomType.DirectMessage);
    trpcMsw.room.directMessage.hideDirectMessage.mutation(() => {
      throw trpcError;
    });
    const directMessageStore = useDirectMessageStore();
    const { directMessages } = storeToRefs(directMessageStore);
    const { arriveDirectMessages, hideDirectMessage } = directMessageStore;
    arriveDirectMessages([directMessage]);
    const userToRoomStore = useUserToRoomStore();
    const { arriveUserToRooms } = userToRoomStore;
    arriveUserToRooms([createUserToRoom({ roomId: directMessage.id, userId: session.user.id })]);
    hideDirectMessage(directMessage.id);
    await flushPromises();

    expect(directMessages.value).toStrictEqual([directMessage]);
  });

  // Each conversation's hide is its own entry, so a refused hide drops only the entry it made.
  // The other hide, answered, keeps its conversation off the list.
  test("a refused hide returns only its own conversation to the list", async () => {
    expect.hasAssertions();

    const session = mockReaderSession();
    const firstDirectMessage = createRoom("", RoomType.DirectMessage);
    const secondDirectMessage = createRoom("", RoomType.DirectMessage);
    const { promise: secondHidden, resolve: onSecondHidden } = Promise.withResolvers<true>();
    const { promise: firstCalled, resolve: onFirstCalled } = Promise.withResolvers<true>();
    trpcMsw.room.directMessage.hideDirectMessage.mutation(async ({ input }) => {
      if (input !== firstDirectMessage.id)
        return createUserToRoom({ isHidden: true, roomId: input, userId: session.user.id, version: 1 });

      onFirstCalled(true);
      await secondHidden;
      throw trpcError;
    });
    const directMessageStore = useDirectMessageStore();
    const { directMessages } = storeToRefs(directMessageStore);
    const { arriveDirectMessages, hideDirectMessage } = directMessageStore;
    arriveDirectMessages([firstDirectMessage, secondDirectMessage]);
    const userToRoomStore = useUserToRoomStore();
    const { arriveUserToRooms } = userToRoomStore;
    arriveUserToRooms([
      createUserToRoom({ roomId: firstDirectMessage.id, userId: session.user.id }),
      createUserToRoom({ roomId: secondDirectMessage.id, userId: session.user.id }),
    ]);
    hideDirectMessage(firstDirectMessage.id);
    await firstCalled;
    hideDirectMessage(secondDirectMessage.id);
    await flushPromises();
    onSecondHidden(true);
    await flushPromises();

    expect(directMessages.value).toStrictEqual([firstDirectMessage]);
  });

  // A hide takes the conversation off the list, so the reader on it is taken to the first conversation left
  test("moves the reader off a conversation a hide takes off the list, to the first one left", async () => {
    expect.hasAssertions();

    const session = mockReaderSession();
    const hiddenDirectMessage = createRoom("", RoomType.DirectMessage);
    const landingDirectMessage = createRoom("", RoomType.DirectMessage);
    trpcMsw.room.directMessage.hideDirectMessage.mutation(({ input }) =>
      createUserToRoom({ isHidden: true, roomId: input, userId: session.user.id, version: 1 }),
    );
    const router = useRouter();
    const { promise: inLanding, resolve: onInLanding } = Promise.withResolvers<true>();
    const removeLandingListener = router.afterEach((to) => {
      if (getRouteParam(to.params, "id") !== landingDirectMessage.id) return;
      removeLandingListener();
      onInLanding(true);
    });
    const directMessageStore = useDirectMessageStore();
    const { currentDirectMessageId } = storeToRefs(directMessageStore);
    const { arriveDirectMessages, hideDirectMessage } = directMessageStore;
    arriveDirectMessages([hiddenDirectMessage, landingDirectMessage]);
    const userToRoomStore = useUserToRoomStore();
    const { arriveUserToRooms } = userToRoomStore;
    arriveUserToRooms([
      createUserToRoom({ roomId: hiddenDirectMessage.id, userId: session.user.id }),
      createUserToRoom({ roomId: landingDirectMessage.id, userId: session.user.id }),
    ]);
    await flushPromises();
    setRouteId(hiddenDirectMessage.id);
    hideDirectMessage(hiddenDirectMessage.id);
    await inLanding;

    expect(currentDirectMessageId.value).toBe(landingDirectMessage.id);
  });

  // A leave is the removal of the viewer, so the membership it tombstones takes the conversation off the list.
  // The reader on it is taken to the first conversation left.
  test("moves a reader who leaves a conversation to the first one left", async () => {
    expect.hasAssertions();

    const session = mockReaderSession();
    const leftDirectMessage = createRoom("", RoomType.DirectMessage);
    const landingDirectMessage = createRoom("", RoomType.DirectMessage);
    trpcMsw.room.directMessage.deleteDirectMessageParticipant.mutation(({ input }) => ({
      deletedAt: new Date(0),
      displayName: "displayName",
      roomId: input.roomId,
      userId: input.userId,
      version: 1,
    }));
    const router = useRouter();
    const { promise: inLanding, resolve: onInLanding } = Promise.withResolvers<true>();
    const removeLandingListener = router.afterEach((to) => {
      if (getRouteParam(to.params, "id") !== landingDirectMessage.id) return;
      removeLandingListener();
      onInLanding(true);
    });
    const directMessageStore = useDirectMessageStore();
    const { currentDirectMessageId } = storeToRefs(directMessageStore);
    const { arriveDirectMessages, leaveDirectMessage } = directMessageStore;
    arriveDirectMessages([leftDirectMessage, landingDirectMessage]);
    const userToRoomStore = useUserToRoomStore();
    const { arriveUserToRooms } = userToRoomStore;
    arriveUserToRooms([
      createUserToRoom({ roomId: leftDirectMessage.id, userId: session.user.id }),
      createUserToRoom({ roomId: landingDirectMessage.id, userId: session.user.id }),
    ]);
    await flushPromises();
    setRouteId(leftDirectMessage.id);
    await leaveDirectMessage(leftDirectMessage.id);
    await inLanding;

    expect(currentDirectMessageId.value).toBe(landingDirectMessage.id);
  });

  // The invite is the reader's own message in the friend's direct message, created where none exists.
  // The room the server answers with is drawn with the reader's membership of it.
  // The reader stays where they are, so the send never navigates.
  test("inviteFriend sends the link as the reader's message in a new direct message", async () => {
    expect.hasAssertions();

    const sender = createUser({ name: "sender" });
    useSession.mockReturnValue(ref({ data: { user: { id: sender.id } } }));
    const friendDirectMessage = createRoom("", RoomType.DirectMessage);
    const inviteLink = "";
    const sentMessages: unknown[] = [];
    trpcMsw.room.directMessage.createDirectMessage.mutation(() => friendDirectMessage);
    trpcMsw.userToRoom.readMyUsersToRooms.query(() => [
      createUserToRoom({ roomId: friendDirectMessage.id, userId: sender.id }),
    ]);
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

  // A participant who joins reaches the list through the room's membership topic, which the list's read names beside its rows and participants.
  // The join itself reads nothing, so the list's refresh is the one read that brings the new participant.
  // The participants come with it rather than from a read of their own.
  test("refreshes a direct message's participants from a join through the list, with no read of the participants of its own", async () => {
    expect.hasAssertions();

    const directMessage = createRoom("", RoomType.DirectMessage);
    const membershipTopic = getScopeTopic(getTableName(usersToRoomsInMessage), "roomId", directMessage.id);
    const connectionStore = useConnectionStore();
    const { openUser } = connectionStore;
    openUser();
    const [, onUserFrame] = getLastOpenRealtimeSocketCall();
    effectScope().run(() => {
      useRoomListEvents();
    });
    let participants = [first, second];
    let listReads = 0;
    trpcMsw.room.directMessage.readDirectMessages.query(() => {
      listReads++;
      return { items: [directMessage], nextCursor: "", participants: participantsOf(directMessage.id, participants) };
    });
    trpcMsw.userToRoom.readMyUsersToRooms.query(() => []);
    const directMessageStore = useDirectMessageStore();
    const { getDirectMessageParticipants, readItems } = directMessageStore;
    // The list's answer names its topics in a response header, which msw cannot set.
    // So the test records the topic read while the read runs, and the answer names the membership of the room it lists.
    vi.spyOn(directMessageStore, "readItems").mockImplementation((query, options) =>
      readItems(() => {
        readActiveTopicReads()?.push({ readAt: 0, signature: "", topics: [{ topic: membershipTopic }] });
        return query();
      }, options),
    );
    const { readDirectMessages } = useReadDirectMessages();
    await readDirectMessages();
    participants = [first, second, third];
    onUserFrame?.(
      JSON.stringify({
        data: {
          deletedAt: null,
          displayName: third.name,
          roomId: directMessage.id,
          user: third,
          userId: third.id,
          version: 0,
        },
        type: "joinRoom",
      }),
    );
    await waitForSynchronizedFunctions();

    expect(listReads).toBe(1);

    onUserFrame?.(JSON.stringify({ data: { topic: membershipTopic }, type: "invalidate" }));
    await waitForSynchronizedFunctions();

    expect(listReads).toBe(2);
    expect(getDirectMessageParticipants(directMessage.id).map(({ id }) => id)).toStrictEqual([
      first.id,
      second.id,
      third.id,
    ]);
  });
});
