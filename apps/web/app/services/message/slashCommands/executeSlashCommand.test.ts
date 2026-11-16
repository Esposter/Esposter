// @vitest-environment nuxt
import { SlashCommandType } from "#src/models/message/slashCommands/SlashCommandType";
import { createRoom } from "#src/services/message/room/createRoom.test";
import { setCurrentRoomId } from "#src/services/message/room/setCurrentRoomId.test";
import { executeSlashCommand } from "#src/services/message/slashCommands/executeSlashCommand";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useRoomStore } from "#src/store/message/room/index";
import { waitForSynchronizedFunctions } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { beforeEach, describe, expect, test } from "vitest";

describe(executeSlashCommand, () => {
  const { trpcMsw } = setupMswTrpc();
  const room = createRoom("name");
  const otherRoom = createRoom("otherName");
  const acceptedTopic = "acceptedTopic";
  const rejectedTopic = "rejectedTopic";

  beforeEach(() => {
    setCurrentRoomId(room.id);
  });

  // Both commands write the topic of one room, so the second runs behind the first and applies on top of what it
  // Stored. A topic captured when the command was typed — before the write ahead of it had even been sent —
  // Unwinds the room past that write, back to a topic the user replaced two commands ago
  test("rolls a queued topic back to the topic the command ahead of it stored", async () => {
    expect.hasAssertions();

    const { promise: rejected, resolve: signalRejected } = Promise.withResolvers<void>();
    trpcMsw.room.updateRoom.mutation(({ input }) => {
      if (input.topic !== rejectedTopic) return { ...room, topic: input.topic ?? "" };

      signalRejected();
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const roomStore = useRoomStore();
    const { currentRoom } = storeToRefs(roomStore);
    const { pushRooms } = roomStore;
    pushRooms({ ...room });
    await executeSlashCommand({ parameterValues: { text: acceptedTopic }, type: SlashCommandType.Topic });
    await executeSlashCommand({ parameterValues: { text: rejectedTopic }, type: SlashCommandType.Topic });
    await rejected;
    await flushPromises();

    expect(currentRoom.value?.topic).toBe(acceptedTopic);
  });

  // A missing topic would leave the stored one unchanged, so a cleared topic has to reach the server as its empty value
  test("a member clears the topic", async () => {
    expect.hasAssertions();

    trpcMsw.room.updateRoom.mutation(({ input }) => ({ ...room, topic: input.topic ?? acceptedTopic }));
    const roomStore = useRoomStore();
    const { currentRoom } = storeToRefs(roomStore);
    const { pushRooms } = roomStore;
    pushRooms({ ...room, topic: acceptedTopic });
    await executeSlashCommand({ parameterValues: {}, type: SlashCommandType.Topic });
    await waitForSynchronizedFunctions();

    expect(currentRoom.value?.topic).toBe("");
  });

  // The rollback restores the topic of the room the command was typed in, so it is read from that room rather than
  // From whichever room is on screen once the write has been out and back
  test("rolls a rejected topic back to its own room's topic after a room switch", async () => {
    expect.hasAssertions();

    const { promise: updateGate, resolve: releaseUpdate } = Promise.withResolvers<void>();
    const { promise: rejected, resolve: signalRejected } = Promise.withResolvers<void>();
    trpcMsw.room.updateRoom.mutation(async () => {
      await updateGate;
      signalRejected();
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const roomStore = useRoomStore();
    const { rooms } = storeToRefs(roomStore);
    const { pushRooms } = roomStore;
    pushRooms({ ...room, topic: acceptedTopic }, { ...otherRoom, topic: rejectedTopic });
    const pendingCommand = executeSlashCommand({
      parameterValues: { text: rejectedTopic },
      type: SlashCommandType.Topic,
    });
    setCurrentRoomId(otherRoom.id);
    releaseUpdate();
    await pendingCommand;
    await rejected;
    await flushPromises();

    expect(rooms.value.find(({ id }) => id === room.id)?.topic).toBe(acceptedTopic);
  });
});
