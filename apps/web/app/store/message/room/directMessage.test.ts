// @vitest-environment nuxt
import { useSession } from "@/services/auth/authClient.test";
import { createRoom } from "@/services/message/room/createRoom.test";
import { createUser } from "@/services/message/user/createUser.test";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { useAlertStore } from "@/store/alert";
import { useDirectMessageStore } from "@/store/message/room/directMessage";
import { createMessageEntity, MessageType, RoomType } from "@esposter/db-schema";
import { TRPCError } from "@trpc/server";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("@/services/auth/authClient"), () => import("@/services/auth/authClient.test"));

describe(useDirectMessageStore, () => {
  const { trpcMsw } = setupMswTrpc();
  const roomId = crypto.randomUUID();
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
    const rejectedDeleteDirectMessageParticipant = deleteDirectMessageParticipant(roomId, second.id);
    // A second call issued in the same tick would share the first one's batch and settle with it
    await isSecondCalled;
    await deleteDirectMessageParticipant(roomId, first.id);
    onFirstDeleted(true);
    await rejectedDeleteDirectMessageParticipant;

    expect(getDirectMessageParticipants(roomId)).toStrictEqual([second, third]);
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
    await deleteDirectMessageParticipant(roomId, second.id);

    expect(getDirectMessageParticipants(roomId)).toStrictEqual([first, third]);
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
    const rejectedHideDirectMessage = hideDirectMessage(firstDirectMessage.id);
    // Held the same way as the removal above
    await isFirstCalled;
    await hideDirectMessage(secondDirectMessage.id);
    onSecondHidden(true);
    await rejectedHideDirectMessage;

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
      return createMessageEntity({ message: input.message, roomId: input.roomId, type: input.type, userId: sender.id });
    });
    const directMessageStore = useDirectMessageStore();
    const { directMessages } = storeToRefs(directMessageStore);
    const { inviteFriend } = directMessageStore;
    await inviteFriend(second.id, inviteLink);

    expect(directMessages.value).toStrictEqual([friendDirectMessage]);
    expect(sentMessages).toStrictEqual([
      { files: [], message: inviteLink, replyRowKey: "", roomId: friendDirectMessage.id, type: MessageType.Message },
    ]);
  });
});
