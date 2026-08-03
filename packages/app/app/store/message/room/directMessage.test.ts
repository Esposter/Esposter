// @vitest-environment nuxt
import type { User } from "@esposter/db-schema";

import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useAlertStore } from "@/store/alert";
import { useDirectMessageStore } from "@/store/message/room/directMessage";
import { TRPCError } from "@trpc/server";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe(useDirectMessageStore, () => {
  const server = setupMswTrpc();
  const roomId = crypto.randomUUID();
  const createParticipant = (name: string): User => ({
    biography: "",
    createdAt: new Date("1970-01-01"),
    deletedAt: null,
    email: "",
    emailVerified: false,
    id: crypto.randomUUID(),
    image: "",
    name,
    updatedAt: new Date("1970-01-01"),
  });
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
});
