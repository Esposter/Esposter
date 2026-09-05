import type { CreateWebhookInput } from "#shared/models/db/webhook/CreateWebhookInput";
import type { DeleteWebhookInput } from "#shared/models/db/webhook/DeleteWebhookInput";
import type { RotateTokenInput } from "#shared/models/db/webhook/RotateTokenInput";
import type { UpdateWebhookInput } from "#shared/models/db/webhook/UpdateWebhookInput";
import type { RoomInMessage, WebhookInMessage } from "@esposter/db-schema";
import type { Except } from "type-fest";

import { createOperationData } from "@/services/shared/createOperationData";
import { useRoomStore } from "@/store/message/room";
import { DatabaseEntityType } from "@esposter/db-schema";

export const useWebhookStore = defineStore("message/room/webhook", () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { getSlice, items, ...restData } = useCursorPaginationDataMap<WebhookInMessage>(() => roomStore.scopedRoomId);
  // `items` is the reading view — whichever room the screen is scoped to. Writing through it would file a response
  // Under whatever room is scoped when it lands, so the write functions are only reachable by naming the room they
  // Are for: an operation names it once, up front, and cannot then be affected by the reader opening another room
  const getRoomOperationData = (roomId: RoomInMessage["id"]) =>
    createOperationData(getSlice(roomId).items, ["id"], DatabaseEntityType.Webhook);
  const { executeQuery: executeReadWebhooksQuery } = useMutation();
  const readWebhooks = async (roomId: RoomInMessage["id"]) => {
    // Keyed by the room, so re-opening its settings supersedes the read it interrupted: A→B→A would otherwise let
    // The first A response land last and overwrite the newer list
    await executeReadWebhooksQuery(() => $trpc.webhook.readWebhooks.query({ roomId }), {
      key: roomId,
      onSuccess: (webhooks) => {
        getSlice(roomId).items.value = webhooks;
      },
    });
  };
  const { executeMutation: executeCreateWebhookMutation } = useMutation();
  const { executeMutation: executeUpdateWebhookMutation } = useMutation();
  const { executeMutation: executeRotateTokenMutation } = useMutation();
  const { executeMutation: executeDeleteWebhookMutation } = useMutation();
  const createWebhook = async (roomId: RoomInMessage["id"], input: Except<CreateWebhookInput, "roomId">) => {
    const { createWebhook: storeCreateWebhook } = getRoomOperationData(roomId);
    await executeCreateWebhookMutation(() => $trpc.webhook.createWebhook.mutate({ ...input, roomId }), {
      key: Symbol("createWebhook"),
      onSuccess: (newWebhook) => {
        storeCreateWebhook(newWebhook, true);
      },
    });
  };
  const updateWebhook = async (roomId: RoomInMessage["id"], input: Except<UpdateWebhookInput, "roomId">) => {
    const { items: roomItems } = getSlice(roomId);
    const { updateWebhook: storeUpdateWebhook } = getRoomOperationData(roomId);
    await executeUpdateWebhookMutation(() => $trpc.webhook.updateWebhook.mutate({ ...input, roomId }), {
      // Snapshot when the write is sent rather than when it was issued: a row's name field and its active
      // Switch write different fields of the same webhook, so the second must roll back to what the first stored
      applyOptimistic: () => {
        const previousWebhook = roomItems.value.find(({ id }) => id === input.id);
        const previousValues = previousWebhook ? { ...previousWebhook } : undefined;
        storeUpdateWebhook({ ...input, roomId });
        return () => {
          if (previousValues) storeUpdateWebhook(previousValues);
        };
      },
      // Keyed per webhook so writes to one row queue while different webhooks stay independent
      key: input.id,
      onSuccess: (updatedWebhook) => {
        storeUpdateWebhook(updatedWebhook);
      },
    });
  };
  const rotateToken = async (roomId: RoomInMessage["id"], input: Except<RotateTokenInput, "roomId">) => {
    const { updateWebhook: storeUpdateWebhook } = getRoomOperationData(roomId);
    await executeRotateTokenMutation(() => $trpc.webhook.rotateToken.mutate({ ...input, roomId }), {
      key: input.id,
      onSuccess: (updatedWebhook) => {
        storeUpdateWebhook(updatedWebhook);
      },
    });
  };
  const deleteWebhook = async (roomId: RoomInMessage["id"], input: Except<DeleteWebhookInput, "roomId">) => {
    const { items: roomItems } = getSlice(roomId);
    const { deleteWebhook: storeDeleteWebhook } = getRoomOperationData(roomId);
    await executeDeleteWebhookMutation(() => $trpc.webhook.deleteWebhook.mutate({ ...input, roomId }), {
      // Put back only this row, at the position it held
      applyOptimistic: () => {
        const deletedIndex = roomItems.value.findIndex(({ id }) => id === input.id);
        const deletedWebhook = roomItems.value[deletedIndex];
        storeDeleteWebhook({ id: input.id });
        return () => {
          if (!deletedWebhook) return;

          roomItems.value = roomItems.value.toSpliced(
            Math.min(deletedIndex, roomItems.value.length),
            0,
            deletedWebhook,
          );
        };
      },
      key: input.id,
    });
  };
  return {
    createWebhook,
    deleteWebhook,
    getSlice,
    items,
    readWebhooks,
    rotateToken,
    updateWebhook,
    ...restData,
  };
});
