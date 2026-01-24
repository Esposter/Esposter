import type { CreateWebhookInput } from "#shared/models/db/webhook/CreateWebhookInput";
import type { DeleteWebhookInput } from "#shared/models/db/webhook/DeleteWebhookInput";
import type { RotateTokenInput } from "#shared/models/db/webhook/RotateTokenInput";
import type { UpdateWebhookInput } from "#shared/models/db/webhook/UpdateWebhookInput";
import type { RoomInMessage, WebhookInMessage } from "@esposter/db-schema";
import type { Except } from "type-fest";

import { createOperationData } from "@/services/shared/createOperationData";
import { useRoomStore } from "@/store/message/room";
import { DatabaseEntityType } from "@esposter/db-schema";

export const useWebhookStore = defineStore("message/webhook", () => {
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
  const createWebhook = async (roomId: RoomInMessage["id"], input: Except<CreateWebhookInput, "roomId">) => {
    const newWebhook = await $trpc.webhook.createWebhook.mutate({ ...input, roomId });
    storeCreateWebhook(newWebhook, true);
  };
  const updateWebhook = async (roomId: RoomInMessage["id"], input: Except<UpdateWebhookInput, "roomId">) => {
    const updatedWebhook = await $trpc.webhook.updateWebhook.mutate({ ...input, roomId });
    storeUpdateWebhook(updatedWebhook);
  };
  const rotateToken = async (roomId: RoomInMessage["id"], input: Except<RotateTokenInput, "roomId">) => {
    const updatedWebhook = await $trpc.webhook.rotateToken.mutate({ ...input, roomId });
    storeUpdateWebhook(updatedWebhook);
  };
  const deleteWebhook = async (roomId: RoomInMessage["id"], input: Except<DeleteWebhookInput, "roomId">) => {
    const { id } = await $trpc.webhook.deleteWebhook.mutate({ ...input, roomId });
    storeDeleteWebhook({ id });
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
