import type { MessageEntity } from "#shared/models/db/message/MessageEntity";
import type { Item } from "@/models/shared/Item";

import { RoutePath } from "#shared/models/router/RoutePath";
import { useEsbabblerStore } from "@/store/esbabbler";
import { useRoomStore } from "@/store/esbabbler/room";
import { parse } from "node-html-parser";

export const useMessageActionItems = (
  message: MessageEntity,
  isEditable: Ref<boolean>,
  isCreator: Ref<boolean>,
  {
    onDeleteMode,
    onForward,
    onReply,
    onUpdateMode,
  }: {
    onDeleteMode?: () => void;
    onForward: (rowKey: string) => void;
    onReply: (rowKey: string) => void;
    onUpdateMode: () => void;
  },
) => {
  const esbabblerStore = useEsbabblerStore();
  const { copy } = esbabblerStore;
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
    isEditable.value ? [editMessageItem, forwardMessageItem] : [replyItem, forwardMessageItem],
  );
  const updateMessageMenuItems = computed<Item[]>(() =>
    isEditable.value ? [editMessageItem, replyItem, forwardMessageItem] : [replyItem, forwardMessageItem],
  );
  const actionMessageItems: Item[] = [copyTextItem, copyMessageLinkItem];
  const deleteMessageItem = computed<Item | undefined>(() =>
    isCreator.value && onDeleteMode
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
