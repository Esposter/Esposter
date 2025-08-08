import type { MessageEntity } from "#shared/models/db/message/MessageEntity";
import type { Item } from "@/models/shared/Item";

import { useEsbabblerStore } from "@/store/esbabbler";
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
  const primaryItems = computed<Item[]>(() =>
    isEditable.value ? [editMessageItem, forwardMessageItem] : [replyItem, forwardMessageItem],
  );
  const menuItems = computed<Item[]>(() =>
    isEditable.value
      ? [editMessageItem, replyItem, forwardMessageItem, copyTextItem]
      : [replyItem, forwardMessageItem, copyTextItem],
  );
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
    deleteMessageItem,
    menuItems,
    primaryItems,
  } as const;
};
