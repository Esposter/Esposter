// @vitest-environment nuxt
import type { UpdateUserToRoomInput } from "#shared/models/db/userToRoom/UpdateUserToRoomInput";
import type { ClientMessage } from "#src/models/message/ClientMessage";
import type { Item } from "#src/models/shared/Item";

import { getMockSession } from "#server/trpc/context.test";
import { setupSession } from "#src/services/auth/setupSession.test";
import { createOptimisticMessage } from "#src/services/message/createOptimisticMessage";
import { createUserToRoom } from "#src/services/message/room/createUserToRoom.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useDataStore } from "#src/store/message/data";
import { useUserToRoomStore } from "#src/store/message/room/userToRoom";
import { setRouteId } from "#src/util/router/setRouteId.test";
import { MessageType } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { assert, beforeAll, describe, expect, test, vi } from "vitest";

// The menu is built per mounted message, so a message on screen in both the timeline and the pinned panel has
// Two of them over the one entity — each with its own write, neither queueing behind the other. It reaches
// The app's breakpoints through the layout store, so it only builds inside a mounted component
const mountActionItem = async (messageEntity: ClientMessage, title: string) => {
  let item: Item | undefined;
  await mountSuspended(
    defineComponent({
      setup() {
        const { actionMessageItems } = useMessageActionItems(messageEntity, ref(false), ref(true));
        item = actionMessageItems.value.find((actionMessageItem) => actionMessageItem.title === title);
        return () => h("div");
      },
    }),
  );
  assert.exists(item);
  return item;
};

describe(useMessageActionItems, () => {
  const { trpcMsw } = setupMswTrpc();
  setupSession(getMockSession().user.id);
  const roomId = v7();
  const markUnreadTitle = "Mark Unread From Here";
  const epoch = new Date(0);
  const nextDay = new Date(Temporal.Duration.from({ days: 1 }).total("milliseconds"));
  const dayAfter = new Date(Temporal.Duration.from({ days: 2 }).total("milliseconds"));
  const userToRoom = createUserToRoom({ roomId, userId: getMockSession().user.id });
  const createMessage = (createdAt: Date) => {
    const messageEntity = createOptimisticMessage(
      { message: "", roomId, type: MessageType.Message },
      getMockSession().user.id,
    );
    messageEntity.createdAt = createdAt;
    messageEntity.isPinned = true;
    return messageEntity;
  };
  beforeAll(() => {
    setRouteId(roomId);
  });

  // A rejected unpin owes back the pin state the write beside it left, which is not necessarily pinned: the
  // Second unpin of an already-unpinned message is refused, and assuming it was pinned re-pins a message the
  // Server has no pin for
  test("does not re-pin a message the unpin beside it took the pin off", async () => {
    expect.hasAssertions();

    // The room numbers the message it holds, so the unpin names a positive id rather than a bubble's negative one
    const messageEntity = { ...createMessage(epoch), id: 1 };
    let isFailing = false;
    trpcMsw.message.unpinMessage.mutation(() => {
      if (isFailing) throw new TRPCError({ code: "NOT_FOUND", message: " " });

      isFailing = true;
      return { ...messageEntity, isPinned: false, version: 1 };
    });
    const dataStore = useDataStore();
    const { getSlice } = dataStore;
    getSlice(roomId).items.value = [messageEntity];
    const item = await mountActionItem(messageEntity, "Unpin Message");
    const otherItem = await mountActionItem(messageEntity, "Unpin Message");
    await Promise.all([item.onClick?.(new MouseEvent("click")), otherItem.onClick?.(new MouseEvent("click"))]);

    expect(takeOne(getSlice(roomId).items.value).isPinned).toBe(false);
  });

  // Two mark-unreads move one read marker. The rejected one restores nothing, so the marker the accepted write set is
  // The one the row keeps
  test("a rejected mark-unread leaves the marker the accepted one set", async () => {
    expect.hasAssertions();

    // The accepted click marks the earlier message unread, so the later one's marker is the write refused
    let acceptedLastReadAt: Date | undefined;
    trpcMsw.userToRoom.updateUserToRoom.mutation(({ input }) => {
      if (!input.lastReadAt || input.lastReadAt >= nextDay)
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
      acceptedLastReadAt = input.lastReadAt;
      return { ...userToRoom, lastReadAt: input.lastReadAt, version: 1 };
    });
    // The menus mount into the nuxt app's pinia, so seed the store they read rather than a local one
    const userToRoomStore = useUserToRoomStore();
    const { arriveUserToRooms, getMyUserToRoom } = userToRoomStore;
    arriveUserToRooms([userToRoom]);
    const item = await mountActionItem(createMessage(nextDay), markUnreadTitle);
    const rejectedItem = await mountActionItem(createMessage(dayAfter), markUnreadTitle);
    item.onClick?.(new MouseEvent("click"));
    rejectedItem.onClick?.(new MouseEvent("click"));
    await flushPromises();

    expect(acceptedLastReadAt).toBeDefined();
    expect(getMyUserToRoom(roomId)?.lastReadAt).toStrictEqual(acceptedLastReadAt);
  });

  // The viewer's row is one row, so a mark-unread waits behind a write to the same row that has not answered yet
  test("a mark-unread waits behind a viewer-row write not yet answered for its room", async () => {
    expect.hasAssertions();

    const userToRoomStore = useUserToRoomStore();
    const { arriveUserToRooms, updateUserToRoom } = userToRoomStore;
    arriveUserToRooms([userToRoom]);
    const receivedUpdate = vi.fn<(input: UpdateUserToRoomInput) => void>();
    const { promise: queued, resolve: releaseQueued } = Promise.withResolvers<void>();
    trpcMsw.userToRoom.updateUserToRoom.mutation(async ({ input }) => {
      receivedUpdate(input);
      if (input.displayName !== undefined) await queued;

      return userToRoom;
    });
    updateUserToRoom({ displayName: "queued", roomId });
    const item = await mountActionItem(createMessage(nextDay), markUnreadTitle);
    item.onClick?.(new MouseEvent("click"));
    await flushPromises();

    expect(receivedUpdate).toHaveBeenCalledExactlyOnceWith({ displayName: "queued", roomId });

    releaseQueued();
    await flushPromises();

    expect(receivedUpdate).toHaveBeenLastCalledWith({ lastReadAt: new Date(nextDay.getTime() - 1), roomId });
  });
});
