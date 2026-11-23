// @vitest-environment nuxt
import { setupSession } from "#src/services/auth/setupSession.test";
import { createUserToRoom } from "#src/services/message/room/createUserToRoom.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useAlertStore } from "#src/store/alert";
import { useUserToRoomStore } from "#src/store/message/room/userToRoom";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(useUserToRoomStore, () => {
  const { trpcMsw } = setupMswTrpc();
  const userId = v7();
  const roomId = v7();
  const displayName = "displayName";
  const userToRoom = createUserToRoom({ roomId, userId });
  setupSession(userId);

  // The viewer's row takes the field at once, and the server's row holds once it answers
  test("shows a write on the viewer's row at once, and holds the server's row once it answers", async () => {
    expect.hasAssertions();

    const { promise: isAnswered, resolve: answer } = Promise.withResolvers<void>();
    trpcMsw.userToRoom.updateUserToRoom.mutation(async ({ input }) => {
      await isAnswered;
      return { ...userToRoom, displayName: input.displayName ?? userToRoom.displayName, version: 1 };
    });
    const userToRoomStore = useUserToRoomStore();
    const { arriveUserToRooms, getMyUserToRoom, updateUserToRoom } = userToRoomStore;
    arriveUserToRooms([userToRoom]);
    updateUserToRoom({ displayName, roomId });

    expect(getMyUserToRoom(roomId)?.displayName).toBe(displayName);

    answer();
    await flushPromises();

    expect(getMyUserToRoom(roomId)).toStrictEqual({ ...userToRoom, displayName, version: 1 });
  });

  // A write that names another member patches that member's row, so the viewer's own row keeps its value until it
  // Answers
  test("leaves the viewer's own row as it was when the write names another member", async () => {
    expect.hasAssertions();

    const { promise: isAnswered, resolve: answer } = Promise.withResolvers<void>();
    trpcMsw.userToRoom.updateUserToRoom.mutation(async () => {
      await isAnswered;
      return { ...userToRoom, version: 1 };
    });
    const userToRoomStore = useUserToRoomStore();
    const { arriveUserToRooms, getMyUserToRoom, updateUserToRoom } = userToRoomStore;
    arriveUserToRooms([userToRoom]);
    updateUserToRoom({ displayName, roomId, targetUserId: v7() });

    expect(getMyUserToRoom(roomId)?.displayName).toBe(userToRoom.displayName);

    answer();
    await flushPromises();
  });

  // Two writes to one row queue on it, so the second is sent once the first has answered
  test("sends a write to a row behind an overlapping write that has not answered", async () => {
    expect.hasAssertions();

    const first = "";
    const second = "a";
    const sent: string[] = [];
    const { promise: isFirstAnswered, resolve: answerFirst } = Promise.withResolvers<void>();
    trpcMsw.userToRoom.updateUserToRoom.mutation(async ({ input }) => {
      sent.push(input.displayName ?? "");
      if (input.displayName === first) await isFirstAnswered;

      return { ...userToRoom, displayName: input.displayName ?? "", version: sent.length };
    });
    const userToRoomStore = useUserToRoomStore();
    const { arriveUserToRooms, updateUserToRoom } = userToRoomStore;
    arriveUserToRooms([userToRoom]);
    updateUserToRoom({ displayName: first, roomId });
    updateUserToRoom({ displayName: second, roomId });
    await flushPromises();

    expect(sent).toStrictEqual([first]);

    answerFirst();
    await flushPromises();

    expect(sent).toStrictEqual([first, second]);
  });

  // A rejected write has no entry to undo: the row keeps the value it held, and the error is shown
  test("leaves the viewer's row as it was when the write is rejected, and shows an error", async () => {
    expect.hasAssertions();

    trpcMsw.userToRoom.updateUserToRoom.mutation(() => {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const alertStore = useAlertStore();
    const { alerts } = storeToRefs(alertStore);
    const userToRoomStore = useUserToRoomStore();
    const { arriveUserToRooms, getMyUserToRoom, updateUserToRoom } = userToRoomStore;
    arriveUserToRooms([userToRoom]);
    updateUserToRoom({ displayName, roomId });
    await flushPromises();

    expect(getMyUserToRoom(roomId)?.displayName).toBe(userToRoom.displayName);
    expect(alerts.value).toHaveLength(1);
  });
});
