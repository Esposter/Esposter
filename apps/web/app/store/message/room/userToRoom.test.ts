// @vitest-environment nuxt
import { useUserToRoomStore } from "#src/store/message/room/userToRoom";
import { noop } from "@esposter/shared";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(useUserToRoomStore, () => {
  const roomId = v7();

  // Each panel that edits the viewer's row of a room writes through the store's one executor, so a write sent while
  // Another for the same room is in flight waits for it and the two apply in the order they were issued
  test("queues a write behind an overlapping write to the same room", async () => {
    expect.hasAssertions();

    const userToRoomStore = useUserToRoomStore();
    const { executeUserToRoomMutation } = userToRoomStore;
    const { promise: isFirstSettled, resolve: settleFirst } = Promise.withResolvers<void>();
    const sent: string[] = [];
    executeUserToRoomMutation(
      async () => {
        sent.push("first");
        await isFirstSettled;
      },
      { applyOptimistic: () => noop, key: roomId },
    );
    executeUserToRoomMutation(
      () => {
        sent.push("second");
        return Promise.resolve();
      },
      { applyOptimistic: () => noop, key: roomId },
    );
    await flushPromises();

    expect(sent).toStrictEqual(["first"]);

    settleFirst();
    await flushPromises();

    expect(sent).toStrictEqual(["first", "second"]);
  });
});
