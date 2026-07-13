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
  const { items, ...restData } = useCursorPaginationDataMap<WebhookInMessage>(() => roomStore.currentRoomId);
  const {
    createWebhook: storeCreateWebhook,
    deleteWebhook: storeDeleteWebhook,
    updateWebhook: storeUpdateWebhook,
    ...restOperationData
  } = createOperationData(items, ["id"], DatabaseEntityType.Webhook);
  const readWebhooks = async (roomId: RoomInMessage["id"]) => {
    items.value = await $trpc.webhook.readWebhooks.query({ roomId });
  };
  const executeMutation = useMutation();
  // Server-generated webhook (id, token) — non-optimistic, applied in onSuccess
  const createWebhook = async (roomId: RoomInMessage["id"], input: Except<CreateWebhookInput, "roomId">) => {
    await executeMutation(() => $trpc.webhook.createWebhook.mutate({ ...input, roomId }), {
      onSuccess: (newWebhook) => {
        storeCreateWebhook(newWebhook, true);
      },
    });
  };
  const updateWebhook = async (roomId: RoomInMessage["id"], input: Except<UpdateWebhookInput, "roomId">) => {
    const snapshot = items.value.map((webhook) => ({ ...webhook }));
    await executeMutation(() => $trpc.webhook.updateWebhook.mutate({ ...input, roomId }), {
      applyOptimistic: () => {
        storeUpdateWebhook({ ...input, roomId });
        return () => {
          items.value = snapshot;
        };
      },
      onSuccess: (updatedWebhook) => {
        storeUpdateWebhook(updatedWebhook);
      },
    });
  };
  // Server-generated token — non-optimistic, applied in onSuccess
  const rotateToken = async (roomId: RoomInMessage["id"], input: Except<RotateTokenInput, "roomId">) => {
    await executeMutation(() => $trpc.webhook.rotateToken.mutate({ ...input, roomId }), {
      onSuccess: (updatedWebhook) => {
        storeUpdateWebhook(updatedWebhook);
      },
    });
  };
  const deleteWebhook = async (roomId: RoomInMessage["id"], input: Except<DeleteWebhookInput, "roomId">) => {
    const snapshot = [...items.value];
    await executeMutation(() => $trpc.webhook.deleteWebhook.mutate({ ...input, roomId }), {
      applyOptimistic: () => {
        storeDeleteWebhook({ id: input.id });
        return () => {
          items.value = snapshot;
        };
      },
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
