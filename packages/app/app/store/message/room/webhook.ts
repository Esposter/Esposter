import type { CreateWebhookInput } from "#shared/models/db/webhook/CreateWebhookInput";
import type { DeleteWebhookInput } from "#shared/models/db/webhook/DeleteWebhookInput";
import type { RotateTokenInput } from "#shared/models/db/webhook/RotateTokenInput";
import type { UpdateWebhookInput } from "#shared/models/db/webhook/UpdateWebhookInput";
import type { RoomInMessage, WebhookInMessage } from "@esposter/db-schema";
import type { Except } from "type-fest";

import { useMutation } from "@/composables/shared/useMutation";
import { createOperationData } from "@/services/shared/createOperationData";
import { useRoomStore } from "@/store/message/room";
import { DatabaseEntityType } from "@esposter/db-schema";

export const useWebhookStore = defineStore("message/room/webhook", () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { items, ...restData } = useCursorPaginationDataMap<WebhookInMessage>(() => roomStore.scopedRoomId);
  const {
    createWebhook: storeCreateWebhook,
    deleteWebhook: storeDeleteWebhook,
    updateWebhook: storeUpdateWebhook,
    ...restOperationData
  } = createOperationData(items, ["id"], DatabaseEntityType.Webhook);
  const readWebhooks = async (roomId: RoomInMessage["id"]) => {
    items.value = await $trpc.webhook.readWebhooks.query({ roomId });
  };
  const { executeMutation: executeCreateWebhookMutation } = useMutation();
  const { executeMutation: executeUpdateWebhookMutation } = useMutation();
  const { executeMutation: executeRotateTokenMutation } = useMutation();
  const { executeMutation: executeDeleteWebhookMutation } = useMutation();
  // Server-generated webhook (id, token) — non-optimistic, applied in onSuccess. Creates have no natural
  // Entity key, so each call gets a unique one — overlapping creates must never queue behind each other
  const createWebhook = async (roomId: RoomInMessage["id"], input: Except<CreateWebhookInput, "roomId">) => {
    await executeCreateWebhookMutation(() => $trpc.webhook.createWebhook.mutate({ ...input, roomId }), {
      key: Symbol("createWebhook"),
      onSuccess: (newWebhook) => {
        storeCreateWebhook(newWebhook, true);
      },
    });
  };
  const updateWebhook = async (roomId: RoomInMessage["id"], input: Except<UpdateWebhookInput, "roomId">) => {
    await executeUpdateWebhookMutation(() => $trpc.webhook.updateWebhook.mutate({ ...input, roomId }), {
      // Snapshot when the write is sent rather than when it was issued: a row's name field and its active
      // Switch write different fields of the same webhook, so the second must roll back to what the first stored.
      // Only this row is captured — a whole-list snapshot would also undo every other row's edits and deletions
      applyOptimistic: () => {
        const previousWebhook = items.value.find(({ id }) => id === input.id);
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
  // Server-generated token — non-optimistic, applied in onSuccess
  const rotateToken = async (roomId: RoomInMessage["id"], input: Except<RotateTokenInput, "roomId">) => {
    await executeRotateTokenMutation(() => $trpc.webhook.rotateToken.mutate({ ...input, roomId }), {
      key: input.id,
      onSuccess: (updatedWebhook) => {
        storeUpdateWebhook(updatedWebhook);
      },
    });
  };
  const deleteWebhook = async (roomId: RoomInMessage["id"], input: Except<DeleteWebhookInput, "roomId">) => {
    await executeDeleteWebhookMutation(() => $trpc.webhook.deleteWebhook.mutate({ ...input, roomId }), {
      // Put back only this row, at the position it held. Reinstating a whole-list snapshot would resurrect a
      // Webhook another deletion already removed and undo every edit made while this write was in flight
      applyOptimistic: () => {
        const deletedIndex = items.value.findIndex(({ id }) => id === input.id);
        const deletedWebhook = items.value[deletedIndex];
        storeDeleteWebhook({ id: input.id });
        return () => {
          if (!deletedWebhook) return;

          items.value = items.value.toSpliced(Math.min(deletedIndex, items.value.length), 0, deletedWebhook);
        };
      },
      key: input.id,
    });
  };
  return {
    createWebhook,
    deleteWebhook,
    items,
    readWebhooks,
    rotateToken,
    updateWebhook,
    ...restData,
    ...restOperationData,
  };
});
