// @vitest-environment nuxt
import { SlashCommandType } from "@/models/message/slashCommands/SlashCommandType";
import { createRoom } from "@/services/message/room/createRoom.test";
import { setCurrentRoomId } from "@/services/message/room/setCurrentRoomId.test";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useRoomStore } from "@/store/message/room";
import { TRPCError } from "@trpc/server";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe(useExecuteSlashCommand, () => {
  const server = setupMswTrpc();
  const room = createRoom("name");
  const acceptedTopic = "acceptedTopic";
  const rejectedTopic = "rejectedTopic";

  beforeEach(() => {
    setActivePinia(createPinia());
    setCurrentRoomId(room.id);
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
