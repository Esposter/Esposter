// @vitest-environment nuxt
import { getMockSession } from "#server/trpc/context.test";
import MessageModelRoomSettingsTypeProfileIndex from "#src/components/Message/Model/Room/Settings/Type/Profile/Index.vue";
import { setupSession } from "#src/services/auth/setupSession.test";
import { createRoom } from "#src/services/message/room/createRoom.test";
import { createUserToRoom } from "#src/services/message/room/createUserToRoom.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useUserToRoomStore } from "#src/store/message/room/userToRoom";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("messageModelRoomSettingsTypeProfileIndex", () => {
  const { trpcMsw } = setupMswTrpc();
  setupSession(getMockSession().user.id);
  const room = createRoom("name");
  const userToRoom = createUserToRoom({ roomId: room.id, userId: getMockSession().user.id });

  // The field emits save from blur and from Enter, so a displayName committed with Enter and then blurred writes
  // The same value twice — every one of those writes is a round trip the queue now runs one after the other
  test("writes once when the field saves from both blur and Enter", async () => {
    expect.hasAssertions();

    const displayName = "displayName";
    let updateCount = 0;
    trpcMsw.userToRoom.updateUserToRoom.mutation(({ input }) => {
      updateCount += 1;
      // The server answers with a version above the held row's, so the answer is an arrival that applies
      return { ...userToRoom, displayName: input.displayName ?? userToRoom.displayName, version: 1 };
    });
    const userToRoomStore = useUserToRoomStore();
    const { arriveUserToRooms } = userToRoomStore;
    arriveUserToRooms([userToRoom]);

    const component = await mountSuspended(MessageModelRoomSettingsTypeProfileIndex, { props: { room } });
    const input = component.get("input");
    await input.setValue(displayName);
    await input.trigger("keydown", { key: "Enter" });
    await flushPromises();
    await input.trigger("focusout");
    await flushPromises();

    expect(updateCount).toBe(1);
  });

  // The field shows a rename another client made, so a blur writes nothing back over it
  test("writes nothing when a rename reaches the field the reader has not edited", async () => {
    expect.hasAssertions();

    let updateCount = 0;
    trpcMsw.userToRoom.updateUserToRoom.mutation(() => {
      updateCount += 1;
      return userToRoom;
    });
    const userToRoomStore = useUserToRoomStore();
    const { arriveUserToRooms } = userToRoomStore;
    arriveUserToRooms([userToRoom]);

    const component = await mountSuspended(MessageModelRoomSettingsTypeProfileIndex, { props: { room } });
    arriveUserToRooms([{ ...userToRoom, displayName: "renamed", version: 1 }]);
    await flushPromises();
    await component.get("input").trigger("focusout");
    await flushPromises();

    expect(updateCount).toBe(0);
  });
});
