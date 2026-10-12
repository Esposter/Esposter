<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { WebhookDialogAction } from "@/models/message/room/WebhookDialogAction";
import { WebhookDialogActionMetaMap } from "@/services/message/room/WebhookDialogActionMetaMap";
import { useWebhookStore } from "@/store/message/room/webhook";
import { useWebhookDialogStore } from "@/store/message/room/webhookDialog";

interface Props {
  action: WebhookDialogAction;
  roomId: RoomInMessage["id"];
}

const { action, roomId } = defineProps<Props>();
const webhookStore = useWebhookStore();
const { items } = storeToRefs(webhookStore);
const { deleteWebhook, rotateToken } = webhookStore;
const webhookDialogStore = useWebhookDialogStore();
const { getSelectedId } = webhookDialogStore;
const selectedId = getSelectedId(action);
const write = action === WebhookDialogAction.Delete ? deleteWebhook : rotateToken;
const { isOpen, item: webhook } = useSingletonDialog(selectedId, () =>
  items.value.find(({ id }) => id === selectedId.value),
);
const { confirmLabel, title } = WebhookDialogActionMetaMap[action];
</script>

<template>
  <UiConfirmDialog
    v-if="webhook"
    v-model="isOpen"
    :confirm-label
    :title
    is-optimistic
    :confirm="() => webhook && write(roomId, { id: webhook.id })"
  >
    <p v-if="action === WebhookDialogAction.Delete">Are you sure you want to delete {{ webhook.name }}?</p>
    <p v-else>
      Rotate the token for {{ webhook.name }}? Its current URL stops working, so every service posting through it needs
      the new one.
    </p>
  </UiConfirmDialog>
</template>
