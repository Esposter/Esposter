// @vitest-environment nuxt
import type { Item } from "@/models/shared/Item";
import type { MessageEntity, UserToRoomInMessage } from "@esposter/db-schema";
import type { Router } from "vue-router";

import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useUserToRoomStore } from "@/store/message/room/userToRoom";
import { getMockSession } from "@@/server/trpc/context.test";
import { createMessageEntity, MessageType, NotificationType } from "@esposter/db-schema";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { TRPCError } from "@trpc/server";
import { assert, beforeAll, describe, expect, test } from "vitest";

describe(useMessageActionItems, () => {
  const server = setupMswTrpc();
  const roomId = crypto.randomUUID();
  const message = "message";
  const userToRoom: UserToRoomInMessage = {
    createdAt: new Date(0),
    deletedAt: null,
    isHidden: false,
    lastMessageAt: null,
    mentionCount: 0,
    nickname: "",
    notificationType: NotificationType.DirectMessage,
    roomId,
    timeoutUntil: null,
    updatedAt: new Date(0),
    userId: getMockSession().user.id,
  };
  const createMessage = (createdAt: Date) => {
    const messageEntity = createMessageEntity({
      message,
      roomId,
      type: MessageType.Message,
      userId: getMockSession().user.id,
    });
    messageEntity.createdAt = createdAt;
    messageEntity.isPinned = true;
    return messageEntity;
  };
  // The menu is built per mounted message, so a message on screen in both the timeline and the pinned panel has
  // Two of them over the one entity — each with its own write, neither queueing behind the other. It reaches
  // Vuetify's display composable through the layout store, so it only builds inside a mounted component
  const mountActionItem = async (messageEntity: MessageEntity, title: string) => {
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

  beforeAll(() => {
    // The menu reads the room off the route, so a room is only current once the route names it — and through
    // TriggerRef, because currentRoute is a shallowRef
    const router: Router = useRouter();
    router.currentRoute.value.params.id = roomId;
    triggerRef(router.currentRoute);
  });

  // A rejected unpin owes back the pin state the write beside it left, which is not necessarily pinned: the
  // Second unpin of an already-unpinned message is refused, and assuming it was pinned re-pins a message the
  // Server has no pin for
  test("does not re-pin a message the unpin beside it took the pin off", async () => {
    expect.hasAssertions();

    let isFailing = false;
    server.use(
      trpcMsw.message.unpinMessage.mutation(() => {
        if (isFailing) throw new TRPCError({ code: "NOT_FOUND", message: "error" });

        isFailing = true;
      }),
    );
    const messageEntity = createMessage(new Date(0));
    const item = await mountActionItem(messageEntity, "Unpin Message");
    const otherItem = await mountActionItem(messageEntity, "Unpin Message");
    await Promise.all([item.onClick?.(new MouseEvent("click")), otherItem.onClick?.(new MouseEvent("click"))]);

    expect(messageEntity.isPinned).toBeUndefined();
  });

  // Two mark-unreads move one read marker, so the rejected one owes back the marker the write beside it stored —
  // Restoring the row as it read when the user clicked drops that marker and marks the room read again
  test("rolls a rejected mark-unread back to the marker the write beside it stored", async () => {
    expect.hasAssertions();

    const acceptedLastMessageAt = new Date(1);
    server.use(
      trpcMsw.userToRoom.updateUserToRoom.mutation(({ input }) => {
        if (input.lastMessageAt?.getTime() !== acceptedLastMessageAt.getTime())
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });
        return { ...userToRoom, lastMessageAt: input.lastMessageAt };
      }),
    );
    // The menus mount into the nuxt app's pinia, so seed the store they read rather than a local one
    const userToRoomStore = useUserToRoomStore();
    const { getMyUserToRoom, setMyUserToRoom } = userToRoomStore;
    setMyUserToRoom(roomId, userToRoom);
    const item = await mountActionItem(createMessage(new Date(2)), "Mark Unread From Here");
    const rejectedItem = await mountActionItem(createMessage(new Date(4)), "Mark Unread From Here");
    await Promise.all([item.onClick?.(new MouseEvent("click")), rejectedItem.onClick?.(new MouseEvent("click"))]);

    expect(getMyUserToRoom(roomId)?.lastMessageAt).toStrictEqual(acceptedLastMessageAt);
  });
});
