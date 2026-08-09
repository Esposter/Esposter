// @vitest-environment nuxt
import type { User } from "@esposter/db-schema";

import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useAlertStore } from "@/store/alert";
import { useDirectMessageStore } from "@/store/message/room/directMessage";
import { createRoom } from "@/store/message/room/index.test";
import { RoomType, StorageTier } from "@esposter/db-schema";
import { TRPCError } from "@trpc/server";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

const createParticipant = (name: string): User => ({
  biography: "",
  createdAt: new Date("1970-01-01"),
  deletedAt: null,
  email: "",
  emailVerified: false,
  id: crypto.randomUUID(),
  image: "",
  name,
  storageBytesUsed: 0,
  storageTier: StorageTier.Free,
  updatedAt: new Date("1970-01-01"),
});

describe(useDirectMessageStore, () => {
  const server = setupMswTrpc();
  const roomId = crypto.randomUUID();
  const first = createParticipant("first");
  const second = createParticipant("second");
  const third = createParticipant("third");

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  // Each participant is its own target, so removals overlap: the failing one is rolled back into a list the
  // Successful one has already shortened, and an index captured before that would put it back in the wrong place
  test("restores a failed removal beside the participant that followed it", async () => {
    expect.hasAssertions();

    server.use(
      trpcMsw.room.directMessage.deleteDirectMessageParticipant.mutation(({ input: { userId } }) => {
        if (userId === second.id) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });
        return first;
      }),
    );
    const alertStore = useAlertStore();
    const directMessageStore = useDirectMessageStore();
    const { deleteDirectMessageParticipant } = directMessageStore;
    const { directMessageParticipantsMap } = storeToRefs(directMessageStore);
    directMessageParticipantsMap.value.set(roomId, [first, second, third]);
    await Promise.all([
      deleteDirectMessageParticipant(roomId, second.id),
      deleteDirectMessageParticipant(roomId, first.id),
    ]);

    expect(directMessageParticipantsMap.value.get(roomId)).toStrictEqual([second, third]);
    expect(alertStore.alerts).toHaveLength(1);
  });

  test("removes a participant from the list on success", async () => {
    expect.hasAssertions();

    server.use(trpcMsw.room.directMessage.deleteDirectMessageParticipant.mutation(() => second));
    const alertStore = useAlertStore();
    const directMessageStore = useDirectMessageStore();
    const { deleteDirectMessageParticipant } = directMessageStore;
    const { directMessageParticipantsMap } = storeToRefs(directMessageStore);
    directMessageParticipantsMap.value.set(roomId, [first, second, third]);
    await deleteDirectMessageParticipant(roomId, second.id);

    expect(directMessageParticipantsMap.value.get(roomId)).toStrictEqual([first, third]);
    expect(alertStore.alerts).toHaveLength(0);
  });

  // Each conversation is its own target, so hiding two in quick succession overlaps: the rejected one has to put
  // Back its own conversation only, or it un-hides the one the successful write already took off the list
  test("restores only the conversation whose hide was rejected", async () => {
    expect.hasAssertions();

    const firstDirectMessage = createRoom("", RoomType.DirectMessage);
    const secondDirectMessage = createRoom("", RoomType.DirectMessage);
    server.use(
      trpcMsw.room.directMessage.hideDirectMessage.mutation(({ input }) => {
        if (input === firstDirectMessage.id) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });
      }),
    );
    const directMessageStore = useDirectMessageStore();
    const { hideDirectMessage, pushDirectMessages } = directMessageStore;
    const { directMessages } = storeToRefs(directMessageStore);
    pushDirectMessages(firstDirectMessage, secondDirectMessage);
    await Promise.all([hideDirectMessage(firstDirectMessage.id), hideDirectMessage(secondDirectMessage.id)]);

    expect(directMessages.value).toStrictEqual([firstDirectMessage]);
  });
});
