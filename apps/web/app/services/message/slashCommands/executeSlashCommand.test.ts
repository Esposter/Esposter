// @vitest-environment nuxt
import { useReadRooms } from "#src/composables/message/room/useReadRooms";
import { SlashCommandType } from "#src/models/message/slashCommands/SlashCommandType";
import { useSession } from "#src/services/auth/authClient.test";
import { createRoom } from "#src/services/message/room/createRoom.test";
import { createUserToRoom } from "#src/services/message/room/createUserToRoom.test";
import { setCurrentRoomId } from "#src/services/message/room/setCurrentRoomId.test";
import { UNFLIP_FACE } from "#src/services/message/slashCommands/constants";
import { executeSlashCommand } from "#src/services/message/slashCommands/executeSlashCommand";
import { SlashCommandDefinitionMap } from "#src/services/message/slashCommands/SlashCommandDefinitionMap";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useDataStore } from "#src/store/message/data";
import { useRoomStore } from "#src/store/message/room/index";
import { MessageType } from "@esposter/db-schema";
import { waitForSynchronizedFunctions } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { marked } from "marked";
import { v7 } from "uuid";
import { beforeEach, describe, expect, test, vi } from "vitest";

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

  // The answer to a topic is the room's row at the version it stored. A newer row a read brought back while the write
  // Was in flight stays, since the older answer lands behind it and loses on its version
  test("an older topic answer does not overwrite the newer topic a read brought back", async () => {
    expect.hasAssertions();

    const session = { user: { id: v7() } };
    useSession.mockImplementation((fetcher) => (fetcher ? { data: ref(session) } : ref({ data: session })));
    const newerTopic = "newerTopic";
    const { promise: isAnswerHeld, resolve: onAnswerHeld } = Promise.withResolvers<true>();
    const { promise: releaseAnswer, resolve: onReleaseAnswer } = Promise.withResolvers<true>();
    trpcMsw.room.updateRoom.mutation(async ({ input }) => {
      onAnswerHeld(true);
      await releaseAnswer;
      return { ...room, topic: input.topic ?? "", version: 5 };
    });
    let readCount = 0;
    trpcMsw.room.readRooms.query(() => {
      readCount++;
      const isFirstRead = readCount === 1;
      return {
        items: [
          { ...room, displayName: room.name, topic: isFirstRead ? "" : newerTopic, version: isFirstRead ? 4 : 6 },
        ],
        nextCursor: "",
      };
    });
    trpcMsw.userToRoom.readMyUsersToRooms.query(() => [createUserToRoom({ roomId: room.id, userId: session.user.id })]);
    trpcMsw.role.readMyPermissions.query(() => []);
    trpcMsw.role.readRoles.query(() => []);
    const roomStore = useRoomStore();
    const { currentRoom } = storeToRefs(roomStore);
    const { readRooms } = await useReadRooms();
    await readRooms();
    const pendingCommand = executeSlashCommand({
      parameterValues: { text: "olderTopic" },
      type: SlashCommandType.Topic,
    });
    await isAnswerHeld;
    await readRooms();
    onReleaseAnswer(true);
    await pendingCommand;
    await waitForSynchronizedFunctions();
    await flushPromises();

    expect(currentRoom.value?.topic).toBe(newerTopic);
  });

  // The menu describes the face the command sends, so the two are one constant and cannot name different faces
  test("the unflip command posts the face its definition names", async () => {
    expect.hasAssertions();

    const dataStore = useDataStore();
    const sendMessage = vi.spyOn(dataStore, "sendMessage").mockResolvedValue(undefined);
    await executeSlashCommand({ parameterValues: {}, type: SlashCommandType.Unflip });

    expect(SlashCommandDefinitionMap[SlashCommandType.Unflip].description).toBe(
      `Appends ${UNFLIP_FACE} to your message`,
    );
    expect(sendMessage).toHaveBeenCalledExactlyOnceWith({
      message: marked.parse(UNFLIP_FACE, { async: false }),
      replyToId: null,
      roomId: room.id,
      type: MessageType.Message,
    });
  });
});
