import type { CreateWebhookInput } from "#shared/models/db/webhook/CreateWebhookInput";
import type { DeleteWebhookInput } from "#shared/models/db/webhook/DeleteWebhookInput";
import type { RegenerateTokenInput } from "#shared/models/db/webhook/RegenerateTokenInput";
import type { UpdateWebhookInput } from "#shared/models/db/webhook/UpdateWebhookInput";
import type { IssuedWebhookInMessage, PublicWebhookInMessage, RoomInMessage } from "@esposter/db-schema";
import type { Except } from "type-fest";

import { createOperationData } from "@/services/shared/createOperationData";
import { getRestoredItems } from "@/services/shared/getRestoredItems";
import { useRoomStore } from "@/store/message/room";
import { useWebhookDialogStore } from "@/store/message/room/webhookDialog";
import { DatabaseEntityType } from "@esposter/db-schema";

export const useWebhookStore = defineStore("message/room/webhook", () => {
  const { $trpc } = useNuxtApp();
  const runtimeConfig = useRuntimeConfig();
  const roomStore = useRoomStore();
  const webhookDialogStore = useWebhookDialogStore();
  const { getSlice, items, ...restData } = useCursorPaginationDataMap<PublicWebhookInMessage>(
    () => roomStore.scopedRoomId,
  );
  // `items` is the reading view — whichever room the screen is scoped to. Writing through it would file a response
  // Under whatever room is scoped when it lands, so the write functions are only reachable by naming the room they
  // Are for: an operation names it once, up front, and cannot then be affected by the reader opening another room
  const getRoomOperationData = (roomId: RoomInMessage["id"]) =>
    createOperationData(getSlice(roomId).items, ["id"], DatabaseEntityType.Webhook);
  // The credential is answered once, by the write that issues it, and is shown in its own dialog until that closes
  const showIssuedUrl = ({ token, webhook }: IssuedWebhookInMessage) => {
    webhookDialogStore.issuedUrl = `${runtimeConfig.public.baseUrl}/api/webhooks/${webhook.id}/${token}`;
  };
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
  const { executeMutation: executeCreateWebhookMutation, isPending: isCreateWebhookPending } = useMutation();
  const { executeMutation: executeUpdateWebhookMutation } = useMutation();
  const { executeMutation: executeRegenerateTokenMutation } = useMutation();
  const { executeMutation: executeDeleteWebhookMutation } = useMutation();
  const createWebhook = async (roomId: RoomInMessage["id"], input: Except<CreateWebhookInput, "roomId">) => {
    const { createWebhook: storeCreateWebhook } = getRoomOperationData(roomId);
    await executeCreateWebhookMutation(() => $trpc.webhook.createWebhook.mutate({ ...input, roomId }), {
      key: Symbol("createWebhook"),
      onSuccess: (issuedWebhook) => {
        storeCreateWebhook(issuedWebhook.webhook, true);
        showIssuedUrl(issuedWebhook);
      },
    });
  };
  const updateWebhook = async (roomId: RoomInMessage["id"], input: Except<UpdateWebhookInput, "roomId">) => {
    const { items: roomItems } = getSlice(roomId);
    const { updateWebhook: storeUpdateWebhook } = getRoomOperationData(roomId);
    await executeUpdateWebhookMutation(() => $trpc.webhook.updateWebhook.mutate({ ...input, roomId }), {
      // Snapshot when the write is sent rather than when it was issued: a row's name field and its active
      // Switch write different fields of the same webhook, so the second must roll back to what the first stored.
      // Only the fields this write names: a regeneration is its own write, and touches no field of the row it is shown on
      applyOptimistic: () => {
        const previousWebhook = roomItems.value.find(({ id }) => id === input.id);
        const previousValues = previousWebhook && {
          id: previousWebhook.id,
          ...(input.isActive !== undefined && { isActive: previousWebhook.isActive }),
          ...(input.name !== undefined && { name: previousWebhook.name }),
        };
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
  const regenerateToken = async (roomId: RoomInMessage["id"], input: Except<RegenerateTokenInput, "roomId">) => {
    const { updateWebhook: storeUpdateWebhook } = getRoomOperationData(roomId);
    await executeRegenerateTokenMutation(() => $trpc.webhook.regenerateToken.mutate({ ...input, roomId }), {
      key: input.id,
      onSuccess: (regeneratedWebhook) => {
        storeUpdateWebhook(regeneratedWebhook.webhook);
        showIssuedUrl(regeneratedWebhook);
      },
    });
  };
  const deleteWebhook = async (roomId: RoomInMessage["id"], input: Except<DeleteWebhookInput, "roomId">) => {
    const { items: roomItems } = getSlice(roomId);
    const { deleteWebhook: storeDeleteWebhook } = getRoomOperationData(roomId);
    await executeDeleteWebhookMutation(() => $trpc.webhook.deleteWebhook.mutate({ ...input, roomId }), {
      applyOptimistic: () => {
        const deletedIndex = roomItems.value.findIndex(({ id }) => id === input.id);
        const deletedWebhook = roomItems.value[deletedIndex];
        storeDeleteWebhook({ id: input.id });
        return () => {
          if (deletedWebhook) roomItems.value = getRestoredItems(roomItems.value, deletedWebhook, deletedIndex);
        };
      },
      key: input.id,
    });
  };
  return {
    createWebhook,
    deleteWebhook,
    getSlice,
    isCreateWebhookPending,
    items,
    readWebhooks,
    regenerateToken,
    updateWebhook,
    ...restData,
  };
});
