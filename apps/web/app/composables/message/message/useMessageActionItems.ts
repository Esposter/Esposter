import type { ClientMessage } from "#src/models/message/ClientMessage";
import type { Item } from "#src/models/shared/Item";

import { MessageOperation } from "#shared/models/message/MessageOperation";
import { checkIsMessageOperationPermitted } from "#shared/services/message/checkIsMessageOperationPermitted";
import { getMessageOperationPermission } from "#shared/services/message/getMessageOperationPermission";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { useClipboardStore } from "#src/store/clipboard";
import { useDataStore } from "#src/store/message/data";
import { useMessageDialogStore } from "#src/store/message/dialog";
import { useMessageStore } from "#src/store/message/index";
import { useForwardStore } from "#src/store/message/input/forward";
import { useReplyStore } from "#src/store/message/input/reply";
import { useRoleStore } from "#src/store/message/room/role";
import { useUserToRoomStore } from "#src/store/message/room/userToRoom";
import { MessageType, RoomPermission } from "@esposter/db-schema";
import { exhaustiveGuard, normalizeString } from "@esposter/shared";
import { parse } from "node-html-parser";

export const useMessageActionItems = (message: ClientMessage, isEditable: Ref<boolean>, isCreator: Ref<boolean>) => {
  const dataStore = useDataStore();
  const { unpinMessage } = dataStore;
  const clipboardStore = useClipboardStore();
  const { copy } = clipboardStore;
  const messageStore = useMessageStore();
  const { editingMessageId } = storeToRefs(messageStore);
  const messageDialogStore = useMessageDialogStore();
  const { deletingMessageId, pinningMessageId } = storeToRefs(messageDialogStore);
  const replyStore = useReplyStore();
  const { replyToId } = storeToRefs(replyStore);
  const forwardStore = useForwardStore();
  const { forwardMessageId } = storeToRefs(forwardStore);
  const copyMessageLink = useCopyMessageLink();
  const userToRoomStore = useUserToRoomStore();
  const { updateMyUserToRoom } = userToRoomStore;
  const openThread = useOpenThread();
  const roleStore = useRoleStore();
  const { checkHasMyPermission } = roleStore;
  const hasManageMessages = computed(() => checkHasMyPermission(message.roomId, RoomPermission.ManageMessages));
  // The same declaration getMessageProcedure guards with, so the menu can never offer an operation the procedure
  // Refuses — presence answers whether the type supports it, the value answers whether this caller may perform it
  const checkIsOperationPermitted = (operation: MessageOperation) =>
    checkIsMessageOperationPermitted(getMessageOperationPermission(message.type, operation), {
      hasManageMessages: hasManageMessages.value,
      isAuthor: isCreator.value,
    });
  // Replying to and forwarding a message are neither authored nor moderated actions, so they ride the type's
  // Support for an update rather than this caller's permission to perform one
  const isUpdateSupported = computed(() =>
    Boolean(getMessageOperationPermission(message.type, MessageOperation.Update)),
  );
  const editMessageItem = {
    meaning: UiIconMeaning.Edit,
    onClick: () => {
      editingMessageId.value = message.id;
    },
    shortTitle: "Edit",
    title: "Edit Message",
  } satisfies Item;
  const replyItem = {
    meaning: UiIconMeaning.Reply,
    onClick: () => {
      replyToId.value = message.id;
    },
    title: "Reply",
  } satisfies Item;
  const forwardMessageItem = {
    meaning: UiIconMeaning.Forward,
    onClick: () => {
      forwardMessageId.value = message.id;
    },
    title: "Forward",
  } satisfies Item;
  const copyTextItem: Item = {
    meaning: UiIconMeaning.Copy,
    onClick: async () => {
      const textContent = normalizeString(parse(message.message).textContent);
      if (textContent) await copy(textContent);
    },
    title: "Copy Text",
  };
  const pinMessageItem = computed<Item>(() =>
    message.isPinned
      ? {
          meaning: UiIconMeaning.Unpin,
          onClick: async () => {
            await unpinMessage({ id: message.id, roomId: message.roomId });
          },
          title: "Unpin Message",
        }
      : {
          meaning: UiIconMeaning.Pin,
          onClick: () => {
            pinningMessageId.value = message.id;
          },
          title: "Pin Message",
        },
  );
  const viewThreadItem = {
    meaning: UiIconMeaning.Thread,
    onClick: async () => {
      await openThread(message.roomId, message.id);
    },
    title: "View Thread",
  } satisfies Item;
  const copyMessageLinkItem: Item = {
    meaning: UiIconMeaning.Link,
    onClick: async () => {
      await copyMessageLink(message.roomId, message.id);
    },
    title: "Copy Message Link",
  };
  const markUnreadFromHereItem: Item = {
    meaning: UiIconMeaning.Unread,
    onClick: () => {
      const lastReadAt = new Date(message.createdAt.getTime() - 1);
      updateMyUserToRoom({ lastReadAt, roomId: message.roomId });
    },
    title: "Mark Unread From Here",
  };
  const pinMessageItems = computed<Item[]>(() =>
    checkIsOperationPermitted(MessageOperation.Pin) ? [pinMessageItem.value] : [],
  );
  // Discord's hover bar carries the thread button beside reply, and burying it in the overflow menu is what made
  // A thread something you had to know about rather than something the message offers
  const threadMessageItems = computed(() => (message.type === MessageType.Message ? [viewThreadItem] : []));
  const updateMessageItems = computed(() =>
    isUpdateSupported.value
      ? isEditable.value
        ? [...threadMessageItems.value, editMessageItem, forwardMessageItem]
        : [...threadMessageItems.value, replyItem, forwardMessageItem]
      : [],
  );
  const updateMessageMenuItems = computed<Item[]>(() =>
    isUpdateSupported.value
      ? isEditable.value
        ? [...threadMessageItems.value, editMessageItem, replyItem, forwardMessageItem]
        : [...threadMessageItems.value, replyItem, forwardMessageItem]
      : [],
  );
  const actionMessageItems = computed<Item[]>(() => {
    switch (message.type) {
      case MessageType.Call:
        return [markUnreadFromHereItem, copyMessageLinkItem];
      case MessageType.EditRoom:
        return [copyTextItem, markUnreadFromHereItem, copyMessageLinkItem];
      case MessageType.Message:
        return [copyTextItem, ...pinMessageItems.value, markUnreadFromHereItem, copyMessageLinkItem];
      case MessageType.PinMessage:
        return [markUnreadFromHereItem, copyMessageLinkItem];
      case MessageType.Poll:
        return [...pinMessageItems.value, markUnreadFromHereItem, copyMessageLinkItem];
      case MessageType.System:
        return [markUnreadFromHereItem, copyMessageLinkItem];
      case MessageType.Webhook:
        return [copyTextItem, ...pinMessageItems.value, markUnreadFromHereItem, copyMessageLinkItem];
      default:
        return exhaustiveGuard(message.type);
    }
  });
  const deleteMessageItem = computed<Item | undefined>(() =>
    checkIsOperationPermitted(MessageOperation.Delete)
      ? {
          isDanger: true,
          meaning: UiIconMeaning.Delete,
          onClick: () => {
            deletingMessageId.value = message.id;
          },
          title: "Delete Message",
        }
      : undefined,
  );
  return { actionMessageItems, deleteMessageItem, updateMessageItems, updateMessageMenuItems };
};
