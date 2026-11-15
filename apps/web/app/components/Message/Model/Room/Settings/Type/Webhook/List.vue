<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { WebhookDialogAction } from "#src/models/message/room/WebhookDialogAction";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { useWebhookStore } from "#src/store/message/room/webhook";

interface Props {
  roomId: RoomInMessage["id"];
}

defineProps<Props>();
const webhookStore = useWebhookStore();
const { items } = storeToRefs(webhookStore);
</script>

<template>
  <UiEmptyState
    v-if="items.length === 0"
    description="Create one and paste its URL into the service that should post here."
    :meaning="UiIconMeaning.Link"
    title="No webhooks yet"
  />
  <div v-else role="list" aria-label="Webhooks" flex flex-col gap-1>
    <MessageModelRoomSettingsTypeWebhookListItem v-for="webhook of items" :key="webhook.id" :room-id :webhook />
  </div>
  <MessageModelRoomSettingsTypeWebhookConfirmDialog :action="WebhookDialogAction.Delete" :room-id />
  <MessageModelRoomSettingsTypeWebhookConfirmDialog :action="WebhookDialogAction.Regenerate" :room-id />
</template>
