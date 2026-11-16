<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { WebhookDialogAction } from "#src/models/message/room/WebhookDialogAction";
import { WebhookDialogActionMetaMap } from "#src/services/message/room/WebhookDialogActionMetaMap";
import { useWebhookStore } from "#src/store/message/room/webhook";
import { useWebhookDialogStore } from "#src/store/message/room/webhookDialog";

interface Props {
  action: WebhookDialogAction;
  roomId: RoomInMessage["id"];
}

const { action } = defineProps<Props>();
const webhookStore = useWebhookStore();
const { items } = storeToRefs(webhookStore);
const { deleteWebhook, regenerateToken } = webhookStore;
const webhookDialogStore = useWebhookDialogStore();
const { getSelectedId } = webhookDialogStore;
const selectedId = getSelectedId(action);
const write = action === WebhookDialogAction.Delete ? deleteWebhook : regenerateToken;
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
    :confirm="() => webhook && write(roomId, { id: webhook.id })"
  >
    <p v-if="action === WebhookDialogAction.Delete">Are you sure you want to delete {{ webhook.name }}?</p>
    <p v-else>
      Regenerate the URL for {{ webhook.name }}? Its current URL stops working, so every service posting through it
      needs the new one.
    </p>
  </UiConfirmDialog>
</template>
