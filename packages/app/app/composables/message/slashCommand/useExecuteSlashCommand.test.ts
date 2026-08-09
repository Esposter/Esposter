// @vitest-environment nuxt
import type { Router } from "vue-router";

import { SlashCommandType } from "@/models/message/slashCommands/SlashCommandType";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useRoomStore } from "@/store/message/room";
import { createRoom } from "@/store/message/room/index.test";
import { TRPCError } from "@trpc/server";
import { createPinia, setActivePinia } from "pinia";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";

describe(useExecuteSlashCommand, () => {
  const server = setupMswTrpc();
  let router: Router;
  const room = createRoom("name");
  const acceptedTopic = "acceptedTopic";
  const rejectedTopic = "rejectedTopic";

  beforeAll(() => {
    router = useRouter();
  });

  beforeEach(() => {
    setActivePinia(createPinia());
    // The command reads the room off the route, so a room is only current once the route names it — and through
    // TriggerRef, because currentRoute is a shallowRef
    router.currentRoute.value.params.id = room.id;
    triggerRef(router.currentRoute);
  });

  // Both commands write the topic of one room, so the second runs behind the first and applies on top of what it
  // Stored. A topic captured when the command was typed — before the write ahead of it had even been sent —
  // Unwinds the room past that write, back to a topic the user replaced two commands ago
  test("rolls a queued topic back to the topic the command ahead of it stored", async () => {
    expect.hasAssertions();

    server.use(
      trpcMsw.room.updateRoom.mutation(({ input }) => {
        if (input.topic === rejectedTopic) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });
        return { ...room, topic: input.topic ?? "" };
      }),
    );
    const roomStore = useRoomStore();
    const { currentRoom } = storeToRefs(roomStore);
    const { pushRooms } = roomStore;
    const executeSlashCommand = useExecuteSlashCommand();
    pushRooms({ ...room });
    await Promise.all([
      executeSlashCommand({ parameterValues: { text: acceptedTopic }, type: SlashCommandType.Topic }),
      executeSlashCommand({ parameterValues: { text: rejectedTopic }, type: SlashCommandType.Topic }),
    ]);

    expect(currentRoom.value?.topic).toBe(acceptedTopic);
  });
});
