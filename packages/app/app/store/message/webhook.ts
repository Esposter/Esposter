import type { CreateWebhookInput } from "#shared/models/db/webhook/CreateWebhookInput";
import type { DeleteWebhookInput } from "#shared/models/db/webhook/DeleteWebhookInput";
import type { RotateTokenInput } from "#shared/models/db/webhook/RotateTokenInput";
import type { UpdateWebhookInput } from "#shared/models/db/webhook/UpdateWebhookInput";
import type { Room, Webhook } from "@esposter/db-schema";
import type { Except } from "type-fest";

import { createOperationData } from "@/services/shared/createOperationData";
import { useRoomStore } from "@/store/message/room";
import { DatabaseEntityType } from "@esposter/db-schema";

export const useWebhookStore = defineStore("message/webhook", () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { items, ...restData } = useCursorPaginationDataMap<Webhook>(() => roomStore.currentRoomId);
  const {
    createWebhook: storeCreateWebhook,
    deleteWebhook: storeDeleteWebhook,
    updateWebhook: storeUpdateWebhook,
    ...restOperationData
  } = createOperationData(items, ["id"], DatabaseEntityType.Webhook);
  const readWebhooks = async () => {
    if (!roomStore.currentRoomId) return;
    items.value = await $trpc.webhook.readWebhooks.query({ roomId: roomStore.currentRoomId });
  };
  const createWebhook = async (roomId: Room["id"], input: Except<CreateWebhookInput, "roomId">) => {
    if (!roomStore.currentRoomId) return;
    const newWebhook = await $trpc.webhook.createWebhook.mutate({ ...input, roomId: roomStore.currentRoomId });
    storeCreateWebhook(newWebhook, true);
  };
  const updateWebhook = async (input: Except<UpdateWebhookInput, "roomId">) => {
    if (!roomStore.currentRoomId) return;
    const updatedWebhook = await $trpc.webhook.updateWebhook.mutate({
      ...input,
      roomId: roomStore.currentRoomId,
    });
    storeUpdateWebhook(updatedWebhook);
  };
  const rotateToken = async (input: Except<RotateTokenInput, "roomId">) => {
    if (!roomStore.currentRoomId) return;
    const updatedWebhook = await $trpc.webhook.rotateToken.mutate({ ...input, roomId: roomStore.currentRoomId });
    storeUpdateWebhook(updatedWebhook);
  };
  const deleteWebhook = async (input: Except<DeleteWebhookInput, "roomId">) => {
    if (!roomStore.currentRoomId) return;
    const { id } = await $trpc.webhook.deleteWebhook.mutate({ ...input, roomId: roomStore.currentRoomId });
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
