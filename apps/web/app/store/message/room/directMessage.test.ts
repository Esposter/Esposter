// @vitest-environment nuxt
import { createRoom } from "@/services/message/room/createRoom.test";
import { createUser } from "@/services/message/user/createUser.test";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useAlertStore } from "@/store/alert";
import { useDirectMessageStore } from "@/store/message/room/directMessage";
import { RoomType } from "@esposter/db-schema";
import { TRPCError } from "@trpc/server";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe(useDirectMessageStore, () => {
  const server = setupMswTrpc();
  const roomId = crypto.randomUUID();
  const first = createUser({ name: "first" });
  const second = createUser({ name: "second" });
  const third = createUser({ name: "third" });

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  // Each participant is its own target, so removals overlap: the failing one is rolled back into a list the
  // Successful one has already shortened, and an index captured before that would put it back in the wrong place.
  test("restores a failed removal beside the participant that followed it", async () => {
    expect.hasAssertions();

    const { promise: isFirstDeleted, resolve: onFirstDeleted } = Promise.withResolvers<true>();
    server.use(
      trpcMsw.room.directMessage.deleteDirectMessageParticipant.mutation(async ({ input: { userId } }) => {
        if (userId !== second.id) return first;
        await isFirstDeleted;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });
      }),
    );
    const alertStore = useAlertStore();
    const directMessageStore = useDirectMessageStore();
    const { deleteDirectMessageParticipant, getDirectMessageParticipants, storeDirectMessageParticipants } =
      directMessageStore;
    storeDirectMessageParticipants(roomId, [first, second, third]);
    const rejectedDeleteDirectMessageParticipant = deleteDirectMessageParticipant(roomId, second.id);
    await deleteDirectMessageParticipant(roomId, first.id);
    onFirstDeleted(true);
    await rejectedDeleteDirectMessageParticipant;

    expect(getDirectMessageParticipants(roomId)).toStrictEqual([second, third]);
    expect(alertStore.alerts).toHaveLength(1);
  });

  test("removes a participant from the list on success", async () => {
    expect.hasAssertions();

    server.use(trpcMsw.room.directMessage.deleteDirectMessageParticipant.mutation(() => second));
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
    server.use(
      trpcMsw.room.directMessage.hideDirectMessage.mutation(async ({ input }) => {
        if (input !== firstDirectMessage.id) return;
        await isSecondHidden;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });
      }),
    );
    const directMessageStore = useDirectMessageStore();
    const { hideDirectMessage, pushDirectMessages } = directMessageStore;
    const { directMessages } = storeToRefs(directMessageStore);
    pushDirectMessages(firstDirectMessage, secondDirectMessage);
    const rejectedHideDirectMessage = hideDirectMessage(firstDirectMessage.id);
    await hideDirectMessage(secondDirectMessage.id);
    onSecondHidden(true);
    await rejectedHideDirectMessage;

    expect(directMessages.value).toStrictEqual([firstDirectMessage]);
  });
});
