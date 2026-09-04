<script setup lang="ts">
import type { RoomInMessage, WebhookInMessage } from "@esposter/db-schema";

import { useWebhookStore } from "@/store/message/room/webhook";

interface WebhookListItemProps {
  roomId: RoomInMessage["id"];
  webhook: WebhookInMessage;
}

const { roomId, webhook } = defineProps<WebhookListItemProps>();
const runtimeConfig = useRuntimeConfig();
const webhookStore = useWebhookStore();
const { updateWebhook } = webhookStore;
const editedName = ref(webhook.name);
</script>

<template>
  <v-list-item>
    <template #prepend>
      <v-avatar color="background">
        <v-icon icon="mdi-webhook" />
      </v-avatar>
    </template>
    <v-text-field
      v-model="editedName"
      label="Name"
      density="compact"
      @blur="updateWebhook(roomId, { id: webhook.id, name: editedName })"
    />
    <template #append>
      <StyledClipboardIconButton
        :source="`${runtimeConfig.public.baseUrl}/api/webhooks/${webhook.id}/${webhook.token}`"
        text="Copy Webhook URL"
      />
      <MessageModelRoomSettingsTypeWebhookRotateTokenButton :id="webhook.id" :room-id />
      <MessageModelRoomSettingsTypeWebhookDeleteButton :id="webhook.id" />
      <v-spacer />
      <MessageModelRoomSettingsTypeWebhookActiveSwitch :room-id :webhook />
    </template>
  </v-list-item>
</template>

<style scoped>
:deep(.v-list-item__content) {
  overflow: visible;
}
</style>
