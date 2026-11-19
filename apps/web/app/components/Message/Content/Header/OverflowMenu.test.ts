// @vitest-environment nuxt
import type { UpdateUserToRoomInput } from "#shared/models/db/userToRoom/UpdateUserToRoomInput";

import { getMockSession } from "#server/trpc/context.test";
import MessageContentHeaderOverflowMenu from "#src/components/Message/Content/Header/OverflowMenu.vue";
import UiOverflowMenu from "#src/components/Ui/OverflowMenu.vue";
import { NotificationTypeLabelMap } from "#src/services/message/NotificationTypeLabelMap";
import { createUserToRoom } from "#src/services/message/room/createUserToRoom.test";
import { setCurrentRoomId } from "#src/services/message/room/setCurrentRoomId.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useUserToRoomStore } from "#src/store/message/room/userToRoom";
import { NotificationType } from "@esposter/db-schema";
import { noop } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { beforeEach, describe, expect, test, vi } from "vitest";

// Whether the window is a phone's is read from the display composable, so a test says how wide it is before it mounts
const display = vi.hoisted(() => ({ smAndUp: true }));
vi.mock(import("#src/composables/ui/useUiDisplay"), async (importOriginal) => {
  const actual = await importOriginal();

  return { ...actual, useUiDisplay: () => ({ ...actual.useUiDisplay(), smAndUp: shallowRef(display.smAndUp) }) };
});

describe("messageContentHeaderOverflowMenu", () => {
  const { trpcMsw } = setupMswTrpc();

  beforeEach(() => {
    display.smAndUp = true;
  });

  test("from sm up, the menu leaves the call and the toggles to the header", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(MessageContentHeaderOverflowMenu);
    const items = component.findComponent(UiOverflowMenu).props("items");

    expect(items.map(({ title }) => title)).toStrictEqual([
      "Pinned Messages",
      ...Object.values(NotificationType).map((type) => NotificationTypeLabelMap[type]),
    ]);
  });

  test("a phone's menu carries the header's toggles as rows", async () => {
    expect.hasAssertions();

    display.smAndUp = false;
    const component = await mountSuspended(MessageContentHeaderOverflowMenu);
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

  // The viewer's row is one executor's to write, so a notification change waits behind a write to the same room that is
  // Already queued on it, the way a mark-unread does
  test("a notification change waits behind a viewer-row write already queued for its room", async () => {
    expect.hasAssertions();

    const roomId = v7();
    const userId = getMockSession().user.id;
    const userToRoom = createUserToRoom({ roomId, userId });
    const userToRoomStore = useUserToRoomStore();
    const { executeUserToRoomMutation, setMyUserToRoom } = userToRoomStore;
    setMyUserToRoom(roomId, userToRoom);
    const updateUserToRoom = vi.fn<(input: UpdateUserToRoomInput) => void>();
    trpcMsw.userToRoom.updateUserToRoom.mutation(({ input }) => {
      updateUserToRoom(input);
      return { ...userToRoom, notificationType: input.notificationType ?? userToRoom.notificationType };
    });
    const { promise: queued, resolve: releaseQueued } = Promise.withResolvers<void>();
    executeUserToRoomMutation(() => queued, { applyOptimistic: () => noop, key: roomId });
    const component = await mountSuspended(MessageContentHeaderOverflowMenu);
    // Set after mounting, which resets the route the room is read from
    setCurrentRoomId(roomId);
    const item = component
      .findComponent(UiOverflowMenu)
      .props("items")
      .find(({ title }) => title === NotificationTypeLabelMap[NotificationType.Never]);
    item?.onClick?.(new MouseEvent("click"));
    await flushPromises();

    expect(updateUserToRoom).not.toHaveBeenCalled();

    releaseQueued();
    await flushPromises();

    expect(updateUserToRoom).toHaveBeenCalledExactlyOnceWith({ notificationType: NotificationType.Never, roomId });
  });
});
