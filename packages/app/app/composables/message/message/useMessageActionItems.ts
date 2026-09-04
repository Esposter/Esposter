import type { Item } from "@/models/shared/Item";
import type { MessageEntity } from "@esposter/db-schema";

import { MessageOperation } from "#shared/models/message/MessageOperation";
import { checkIsMessageOperationPermitted } from "#shared/services/message/checkIsMessageOperationPermitted";
import { getMessageOperationPermission } from "#shared/services/message/getMessageOperationPermission";
import { useClipboardStore } from "@/store/clipboard";
import { useMessageStore } from "@/store/message";
import { useMessageDialogStore } from "@/store/message/dialog";
import { useForwardStore } from "@/store/message/input/forward";
import { useReplyStore } from "@/store/message/input/reply";
import { useRoleStore } from "@/store/message/room/role";
import { useUserToRoomStore } from "@/store/message/room/userToRoom";
import { useThreadStore } from "@/store/message/thread";
import { checkHasPermission, MessageType, RoomPermission } from "@esposter/db-schema";
import { exhaustiveGuard, noop, normalizeString } from "@esposter/shared";
import { parse } from "node-html-parser";

export const useMessageActionItems = (message: MessageEntity, isEditable: Ref<boolean>, isCreator: Ref<boolean>) => {
  const { $trpc } = useNuxtApp();
  const { executeMutation: executeUnpinMessageMutation } = useMutation();
  const { executeMutation: executeMarkUnreadMutation } = useMutation();
  const clipboardStore = useClipboardStore();
  const { copy } = clipboardStore;
  const messageStore = useMessageStore();
  const { editingRowKey } = storeToRefs(messageStore);
  const messageDialogStore = useMessageDialogStore();
  const { deletingRowKey, pinningRowKey } = storeToRefs(messageDialogStore);
  const replyStore = useReplyStore();
  const { rowKey: replyRowKey } = storeToRefs(replyStore);
  const forwardStore = useForwardStore();
  const { rowKey: forwardRowKey } = storeToRefs(forwardStore);
  const copyMessageLink = useCopyMessageLink();
  const userToRoomStore = useUserToRoomStore();
  const { getMyUserToRoom, setMyUserToRoom } = userToRoomStore;
  const threadStore = useThreadStore();
  const { openThread } = threadStore;
  const roleStore = useRoleStore();
  const { getMyPermissions } = roleStore;
  const hasManageMessages = computed(() => {
    const myPermissions = getMyPermissions(message.partitionKey);
    if (!myPermissions) return false;
    return checkHasPermission(myPermissions.permissions, RoomPermission.ManageMessages, myPermissions.isRoomOwner);
  });
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
                // Read as the write is sent rather than assumed: a pin that landed — or was itself rolled back —
                // Between the click and this write decides what unpinning owes back, and a hard-coded true would
                // Re-pin a message the server never pinned
                applyOptimistic: () => {
                  const previousIsPinned = message.isPinned;
                  delete message.isPinned;
                  return () => {
                    if (previousIsPinned) message.isPinned = previousIsPinned;
                  };
                },
                key: message.rowKey,
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
      await copyMessageLink(message.partitionKey, message.rowKey);
    },
    title: "Copy Message Link",
  };
  const markUnreadFromHereItem: Item = {
    icon: "mdi-email-mark-as-unread",
    onClick: async () => {
      const lastMessageAt = new Date(message.createdAt.getTime() - 1);
      const roomId = message.partitionKey;
      await executeMarkUnreadMutation(() => $trpc.userToRoom.updateUserToRoom.mutate({ lastMessageAt, roomId }), {
        // Read as the write is sent, so a rejected mark-unread restores the marker the write ahead of it stored
        // Rather than the one on screen when the user clicked
        applyOptimistic: () => {
          const previousUserToRoom = getMyUserToRoom(roomId);
          if (!previousUserToRoom) return noop;

          const { lastMessageAt: previousLastMessageAt } = previousUserToRoom;
          setMyUserToRoom(roomId, { ...previousUserToRoom, lastMessageAt });
          return () => {
            // Only the field this write moved, against the record as it stands — reinstating the row as a whole
            // Would undo everything else that landed on it while this write was in flight
            const currentUserToRoom = getMyUserToRoom(roomId);
            if (currentUserToRoom)
              setMyUserToRoom(roomId, { ...currentUserToRoom, lastMessageAt: previousLastMessageAt });
          };
        },
        key: roomId,
      });
    },
    title: "Mark Unread From Here",
  };
  const pinMessageItems = computed<Item[]>(() =>
    checkIsOperationPermitted(MessageOperation.Pin) ? [pinMessageItem.value] : [],
  );
  // Discord's hover bar carries the thread button beside reply, and burying it in the overflow menu is what made
  // A thread something you had to know about rather than something the message offers
  const threadMessageItems = computed<Item[]>(() => (message.type === MessageType.Message ? [viewThreadItem] : []));
  const updateMessageItems = computed<Item[]>(() =>
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
        return exhaustiveGuard(message);
    }
  });
  const deleteMessageItem = computed<Item | undefined>(() =>
    checkIsOperationPermitted(MessageOperation.Delete)
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
