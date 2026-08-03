import type { Item } from "@/models/shared/Item";
import type { MessageEntity } from "@esposter/db-schema";

import { MessageOperation } from "#shared/models/message/MessageOperation";
import { dayjs } from "#shared/services/dayjs";
import { getIsMessageOperationPermitted } from "#shared/services/message/getIsMessageOperationPermitted";
import { getMessageOperationPermission } from "#shared/services/message/getMessageOperationPermission";
import { hasPermission } from "#shared/services/room/rbac/hasPermission";
import { useMessageStore } from "@/store/message";
import { useMessageDialogStore } from "@/store/message/dialog";
import { useForwardStore } from "@/store/message/input/forward";
import { useReplyStore } from "@/store/message/input/reply";
import { useRoomStore } from "@/store/message/room";
import { useRoleStore } from "@/store/message/room/role";
import { useUserToRoomStore } from "@/store/message/room/userToRoom";
import { useThreadStore } from "@/store/message/thread";
import { MessageType, RoomPermission } from "@esposter/db-schema";
import { exhaustiveGuard, normalizeString, RoutePath } from "@esposter/shared";
import { parse } from "node-html-parser";

export const useMessageActionItems = (message: MessageEntity, isEditable: Ref<boolean>, isCreator: Ref<boolean>) => {
  const { $trpc } = useNuxtApp();
  const { executeMutation: executeUnpinMessageMutation } = useMutation();
  const { executeMutation: executeMarkUnreadMutation } = useMutation();
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
  const roleStore = useRoleStore();
  const { getMyPermissions } = roleStore;
  const runtimeConfig = useRuntimeConfig();
  const hasManageMessages = computed(() => {
    const myPermissions = getMyPermissions(message.partitionKey);
    if (!myPermissions) return false;
    return hasPermission(myPermissions.permissions, RoomPermission.ManageMessages, myPermissions.isRoomOwner);
  });
  // The same declaration getMessageProcedure guards with, so the menu can never offer an operation the procedure
  // Refuses — presence answers whether the type supports it, the value answers whether this caller may perform it
  const getIsOperationPermitted = (operation: MessageOperation) =>
    getIsMessageOperationPermitted(getMessageOperationPermission(message.type, operation), {
      hasManageMessages: hasManageMessages.value,
      isAuthor: isCreator.value,
    });
  // Replying to and forwarding a message are neither authored nor moderated actions, so they ride the type's
  // Support for an update rather than this caller's permission to perform one
  const isUpdateSupported = computed(() =>
    Boolean(getMessageOperationPermission(message.type, MessageOperation.Update)),
  );
  const isDeletePermitted = computed(() => getIsOperationPermitted(MessageOperation.Delete));
  const isPinPermitted = computed(() => getIsOperationPermitted(MessageOperation.Pin));
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
        key: roomId,
      });
    },
    title: "Mark Unread From Here",
  };
  const pinMessageItems = computed<Item[]>(() => (isPinPermitted.value ? [pinMessageItem.value] : []));
  const updateMessageItems = computed<Item[]>(() =>
    isUpdateSupported.value
      ? isEditable.value
        ? [editMessageItem, forwardMessageItem]
        : [replyItem, forwardMessageItem]
      : [],
  );
  const updateMessageMenuItems = computed<Item[]>(() =>
    isUpdateSupported.value
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
        return [copyTextItem, viewThreadItem, ...pinMessageItems.value, markUnreadFromHereItem, copyMessageLinkItem];
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
    isDeletePermitted.value
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
