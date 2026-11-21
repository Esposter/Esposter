// @vitest-environment nuxt
import type { UpdateUserToRoomInput } from "#shared/models/db/userToRoom/UpdateUserToRoomInput";

import { getMockSession } from "#server/trpc/context.test";
import MessageContentHeaderOverflowMenu from "#src/components/Message/Content/Header/OverflowMenu.vue";
import UiOverflowMenu from "#src/components/Ui/OverflowMenu.vue";
import { setupSession } from "#src/services/auth/setupSession.test";
import { NotificationTypeLabelMap } from "#src/services/message/NotificationTypeLabelMap";
import { createUserToRoom } from "#src/services/message/room/createUserToRoom.test";
import { setCurrentRoomId } from "#src/services/message/room/setCurrentRoomId.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useUserToRoomStore } from "#src/store/message/room/userToRoom";
import { NotificationType } from "@esposter/db-schema";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { describe, expect, test, vi } from "vitest";

describe("messageContentHeaderOverflowMenu", () => {
  const { trpcMsw } = setupMswTrpc();
  setupSession(getMockSession().user.id);

  test("from sm up, the menu leaves the call and the toggles to the header", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(MessageContentHeaderOverflowMenu, { props: { isToolsInHeader: true } });
    const items = component.findComponent(UiOverflowMenu).props("items");

    expect(items.map(({ title }) => title)).toStrictEqual([
      "Pinned Messages",
      ...Object.values(NotificationType).map((type) => NotificationTypeLabelMap[type]),
    ]);
  });

  test("a phone's menu carries the header's toggles as rows", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(MessageContentHeaderOverflowMenu, { props: { isToolsInHeader: false } });
    const items = component.findComponent(UiOverflowMenu).props("items");

    expect(items.map(({ isChecked, isGroupStart, title }) => ({ isChecked, isGroupStart, title }))).toStrictEqual([
      { isChecked: undefined, isGroupStart: undefined, title: "Start Call" },
      { isChecked: false, isGroupStart: undefined, title: "Followed Threads" },
      { isChecked: false, isGroupStart: undefined, title: "Search" },
      { isChecked: false, isGroupStart: undefined, title: "Member List" },
      { isChecked: undefined, isGroupStart: true, title: "Pinned Messages" },
      ...Object.values(NotificationType).map((type, index) => ({
        isChecked: undefined,
        isGroupStart: index === 0,
        title: NotificationTypeLabelMap[type],
      })),
    ]);
  });

  // The viewer's row is one row, so a notification change waits behind a write to the same row that has not answered
  test("a notification change waits behind a viewer-row write not yet answered for its room", async () => {
    expect.hasAssertions();

    const roomId = v7();
    const userId = getMockSession().user.id;
    const userToRoom = createUserToRoom({ roomId, userId });
    const userToRoomStore = useUserToRoomStore();
    const { arriveUserToRooms, updateUserToRoom } = userToRoomStore;
    arriveUserToRooms([userToRoom]);
    const receivedUpdate = vi.fn<(input: UpdateUserToRoomInput) => void>();
    const { promise: queued, resolve: releaseQueued } = Promise.withResolvers<void>();
    trpcMsw.userToRoom.updateUserToRoom.mutation(async ({ input }) => {
      receivedUpdate(input);
      if (input.displayName !== undefined) await queued;

      return { ...userToRoom, notificationType: input.notificationType ?? userToRoom.notificationType, version: 1 };
    });
    updateUserToRoom({ displayName: "queued", roomId });
    const component = await mountSuspended(MessageContentHeaderOverflowMenu, { props: { isToolsInHeader: true } });
    // Set after mounting, which resets the route the room is read from
    setCurrentRoomId(roomId);
    const item = component
      .findComponent(UiOverflowMenu)
      .props("items")
      .find(({ title }) => title === NotificationTypeLabelMap[NotificationType.Never]);
    item?.onClick?.(new MouseEvent("click"));
    await flushPromises();

    expect(receivedUpdate).toHaveBeenCalledExactlyOnceWith({ displayName: "queued", roomId });

    releaseQueued();
    await flushPromises();

    expect(receivedUpdate).toHaveBeenLastCalledWith({ notificationType: NotificationType.Never, roomId });
  });
});
