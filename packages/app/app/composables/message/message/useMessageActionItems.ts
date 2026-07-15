import type { Item } from "@/models/shared/Item";
import type { MessageEntity } from "@esposter/db-schema";

import { dayjs } from "#shared/services/dayjs";
import { DeletableMessageTypes } from "#shared/services/message/DeletableMessageTypes";
import { UpdatableMessageTypes } from "#shared/services/message/UpdatableMessageTypes";
import { useMessageStore } from "@/store/message";
import { useMessageDialogStore } from "@/store/message/dialog";
import { useForwardStore } from "@/store/message/input/forward";
import { useReplyStore } from "@/store/message/input/reply";
import { useRoomStore } from "@/store/message/room";
import { useUserToRoomStore } from "@/store/message/room/userToRoom";
import { useThreadStore } from "@/store/message/thread";
import { MessageType } from "@esposter/db-schema";
import { exhaustiveGuard, normalizeString, RoutePath } from "@esposter/shared";
import { parse } from "node-html-parser";

export const useMessageActionItems = (message: MessageEntity, isEditable: Ref<boolean>, isCreator: Ref<boolean>) => {
  const { $trpc } = useNuxtApp();
  const executeUnpinMessageMutation = useMutation();
  const executeMarkUnreadMutation = useMutation();
  const messageStore = useMessageStore();
  const { copy } = messageStore;
  const { editingRowKey } = storeToRefs(messageStore);
  const messageDialogStore = useMessageDialogStore();
  const { deletingRowKey, pinningRowKey } = storeToRefs(messageDialogStore);
  const replyStore = useReplyStore();
  const { rowKey: replyRowKey } = storeToRefs(replyStore);
  const forwardStore = useForwardStore();
  const { rowKey: forwardRowKey } = storeToRefs(forwardStore);
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const userToRoomStore = useUserToRoomStore();
  const { getMyUserToRoom, setMyUserToRoom } = userToRoomStore;
  const threadStore = useThreadStore();
  const { openThread } = threadStore;
  const runtimeConfig = useRuntimeConfig();
  const editMessageItem: Item = {
    icon: "mdi-pencil",
    onClick: () => {
      editingRowKey.value = message.rowKey;
    },
    shortTitle: "Edit",
    title: "Edit Message",
  };
  const replyItem: Item = {
    icon: "mdi-reply",
    onClick: () => {
      replyRowKey.value = message.rowKey;
    },
    title: "Reply",
  };
  const forwardMessageItem: Item = {
    icon: "mdi-share",
    onClick: () => {
      forwardRowKey.value = message.rowKey;
    },
    title: "Forward",
  };
  const copyTextItem: Item = {
    icon: "mdi-content-copy",
    onClick: async () => {
      const textContent = normalizeString(parse(message.message).textContent);
      if (textContent) await copy(textContent);
    },
    title: "Copy Text",
  };
  const pinMessageItem = computed<Item>(() =>
    message.isPinned
      ? {
          icon: "mdi-pin-off",
          onClick: async () => {
            await executeUnpinMessageMutation(
              () => $trpc.message.unpinMessage.mutate({ partitionKey: message.partitionKey, rowKey: message.rowKey }),
              {
                applyOptimistic: () => {
                  delete message.isPinned;
                  return () => {
                    message.isPinned = true;
                  };
                },
              },
            );
          },
          title: "Unpin Message",
        }
      : {
          icon: "mdi-pin",
          onClick: () => {
            pinningRowKey.value = message.rowKey;
          },
          title: "Pin Message",
        },
  );
  const viewThreadItem: Item = {
    icon: "mdi-comment-multiple-outline",
    onClick: async () => {
      await openThread(message.partitionKey, message.rowKey);
    },
    title: "View Thread",
  };
  const copyMessageLinkItem: Item = {
    icon: "mdi-link-variant",
    onClick: async () => {
      if (!currentRoomId.value) return;
      const link = `${runtimeConfig.public.baseUrl}${RoutePath.MessagesMessage(currentRoomId.value, message.rowKey)}`;
      await copy(link);
    },
    title: "Copy Message Link",
  };
  const markUnreadFromHereItem: Item = {
    icon: "mdi-email-mark-as-unread",
    onClick: async () => {
      const lastMessageAt = dayjs(message.createdAt).subtract(1, "millisecond").toDate();
      const roomId = message.partitionKey;
      const previousUserToRoom = getMyUserToRoom(roomId);
      await executeMarkUnreadMutation(() => $trpc.userToRoom.updateUserToRoom.mutate({ lastMessageAt, roomId }), {
        applyOptimistic: () => {
          if (previousUserToRoom) setMyUserToRoom(roomId, { ...previousUserToRoom, lastMessageAt });
          return () => {
            if (previousUserToRoom) setMyUserToRoom(roomId, previousUserToRoom);
          };
        },
      });
    },
    title: "Mark Unread From Here",
  };
  const updateMessageItems = computed<Item[]>(() =>
    UpdatableMessageTypes.has(message.type)
      ? isEditable.value
        ? [editMessageItem, forwardMessageItem]
        : [replyItem, forwardMessageItem]
      : [],
  );
  const updateMessageMenuItems = computed<Item[]>(() =>
    UpdatableMessageTypes.has(message.type)
      ? isEditable.value
        ? [editMessageItem, replyItem, forwardMessageItem]
        : [replyItem, forwardMessageItem]
      : [],
  );
  const actionMessageItems = computed<Item[]>(() => {
    switch (message.type) {
      case MessageType.Call:
        return [markUnreadFromHereItem, copyMessageLinkItem];
      case MessageType.EditRoom:
        return [copyTextItem, markUnreadFromHereItem, copyMessageLinkItem];
      case MessageType.Message:
        return [copyTextItem, viewThreadItem, pinMessageItem.value, markUnreadFromHereItem, copyMessageLinkItem];
      case MessageType.PinMessage:
        return [markUnreadFromHereItem, copyMessageLinkItem];
      case MessageType.Poll:
        return [pinMessageItem.value, markUnreadFromHereItem, copyMessageLinkItem];
      case MessageType.System:
        return [markUnreadFromHereItem, copyMessageLinkItem];
      case MessageType.Webhook:
        return [copyTextItem, pinMessageItem.value, markUnreadFromHereItem, copyMessageLinkItem];
      default:
        return exhaustiveGuard(message);
    }
  });
  const deleteMessageItem = computed<Item | undefined>(() =>
    DeletableMessageTypes.has(message.type) && isCreator.value
      ? {
          color: "error",
          icon: "mdi-delete",
          onClick: () => {
            deletingRowKey.value = message.rowKey;
          },
          title: "Delete Message",
        }
      : undefined,
  );
  return {
    actionMessageItems,
    deleteMessageItem,
    updateMessageItems,
    updateMessageMenuItems,
  };
};
