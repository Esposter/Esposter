import type { Item } from "@/models/shared/Item";
import type { MessageEntity } from "@esposter/db-schema";

import { dayjs } from "#shared/services/dayjs";
import { DeletableMessageTypes } from "#shared/services/message/DeletableMessageTypes";
import { UpdatableMessageTypes } from "#shared/services/message/UpdatableMessageTypes";
import { useMessageStore } from "@/store/message";
import { useRoomStore } from "@/store/message/room";
import { useUserToRoomStore } from "@/store/message/room/userToRoom";
import { useThreadStore } from "@/store/message/thread";
import { MessageType } from "@esposter/db-schema";
import { exhaustiveGuard, normalizeString, RoutePath } from "@esposter/shared";
import { parse } from "node-html-parser";

export const useMessageActionItems = (
  message: MessageEntity,
  isEditable: Ref<boolean>,
  isCreator: Ref<boolean>,
  {
    onDeleteMode,
    onForward,
    onPin,
    onReply,
    onUpdateMode,
  }: {
    onDeleteMode?: () => void;
    onForward: (rowKey: string) => void;
    onPin: (value: true) => void;
    onReply: (rowKey: string) => void;
    onUpdateMode: () => void;
  },
) => {
  const { $trpc } = useNuxtApp();
  const messageStore = useMessageStore();
  const { copy } = messageStore;
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const userToRoomStore = useUserToRoomStore();
  const { updateUserToRoom } = userToRoomStore;
  const threadStore = useThreadStore();
  const { openThread } = threadStore;
  const runtimeConfig = useRuntimeConfig();
  const editMessageItem: Item = {
    icon: "mdi-pencil",
    onClick: onUpdateMode,
    shortTitle: "Edit",
    title: "Edit Message",
  };
  const replyItem: Item = {
    icon: "mdi-reply",
    onClick: () => {
      onReply(message.rowKey);
    },
    title: "Reply",
  };
  const forwardMessageItem: Item = {
    icon: "mdi-share",
    onClick: () => {
      onForward(message.rowKey);
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
            await $trpc.message.unpinMessage.mutate({ partitionKey: message.partitionKey, rowKey: message.rowKey });
          },
          title: "Unpin Message",
        }
      : {
          icon: "mdi-pin",
          onClick: () => {
            onPin(true);
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
      await updateUserToRoom({
        lastMessageAt: dayjs(message.createdAt).subtract(1, "millisecond").toDate(),
        roomId: message.partitionKey,
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
    DeletableMessageTypes.has(message.type) && isCreator.value && onDeleteMode
      ? {
          color: "error",
          icon: "mdi-delete",
          onClick: onDeleteMode,
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
