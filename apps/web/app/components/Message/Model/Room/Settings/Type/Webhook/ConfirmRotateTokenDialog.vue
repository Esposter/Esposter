<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { useWebhookStore } from "@/store/message/room/webhook";
import { useWebhookDialogStore } from "@/store/message/room/webhookDialog";

interface Props {
  roomId: RoomInMessage["id"];
}

const { roomId } = defineProps<Props>();
const webhookStore = useWebhookStore();
const { items } = storeToRefs(webhookStore);
const { rotateToken } = webhookStore;
const webhookDialogStore = useWebhookDialogStore();
const { rotatingId } = storeToRefs(webhookDialogStore);
const { isOpen, item: webhook } = useSingletonDialog(rotatingId, () =>
  items.value.find(({ id }) => id === rotatingId.value),
);
</script>

<template>
  <UiConfirmDialog
    v-if="webhook"
    v-model="isOpen"
    confirm-label="Rotate"
    title="Rotate token"
    :confirm="() => webhook && rotateToken(roomId, { id: webhook.id })"
  >
    <p>
      Rotate the token for {{ webhook.name }}? Its current URL stops working, so every service posting through it needs
      the new one.
    </p>
  </UiConfirmDialog>
</template>
