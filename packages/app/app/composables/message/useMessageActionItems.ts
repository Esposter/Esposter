import type { Item } from "@/models/shared/Item";
import type { MessageEntity } from "@esposter/db-schema";

import { RoutePath } from "#shared/models/router/RoutePath";
import { useMessageStore } from "@/store/message";
import { useRoomStore } from "@/store/message/room";
import { MessageType } from "@esposter/db-schema";
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
  const runtimeConfig = useRuntimeConfig();
  const editMessageItem: Item = {
    icon: "mdi-pencil",
    onClick: () => {
      onUpdateMode();
    },
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
    onClick: () => {
      const textContent = parse(message.message).textContent.trim();
      if (textContent) copy(textContent);
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
  const copyMessageLinkItem: Item = {
    icon: "mdi-link-variant",
    onClick: () => {
      if (!currentRoomId.value) return;
      const link = `${runtimeConfig.public.baseUrl}${RoutePath.MessagesMessage(currentRoomId.value, message.rowKey)}`;
      copy(link);
    },
    title: "Copy Message Link",
  };
  const updateMessageItems = computed<Item[]>(() =>
    message.type === MessageType.Message
      ? isEditable.value
        ? [editMessageItem, forwardMessageItem]
        : [replyItem, forwardMessageItem]
      : [],
  );
  const updateMessageMenuItems = computed<Item[]>(() =>
    message.type === MessageType.Message
      ? isEditable.value
        ? [editMessageItem, replyItem, forwardMessageItem]
        : [replyItem, forwardMessageItem]
      : [],
  );
  const actionMessageItems = computed<Item[]>(() => {
    switch (message.type) {
      case MessageType.EditRoom:
        return [copyTextItem, copyMessageLinkItem];
      case MessageType.Message:
      case MessageType.Webhook:
        return [copyTextItem, pinMessageItem.value, copyMessageLinkItem];
      case MessageType.PinMessage:
        return [copyMessageLinkItem];
    }
  });
  const deleteMessageItem = computed<Item | undefined>(() =>
    message.type === MessageType.Message && isCreator.value && onDeleteMode
      ? {
          color: "error",
          icon: "mdi-delete",
          onClick: () => onDeleteMode(),
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
