<script setup lang="ts">
import type { Room, Webhook } from "@esposter/db-schema";

import { useWebhookStore } from "@/store/message/webhook";

interface ListItemProps {
  roomId: Room["id"];
  webhook: Webhook;
}

const { roomId, webhook } = defineProps<ListItemProps>();
const webhookStore = useWebhookStore();
const { updateWebhook } = webhookStore;
const name = ref(webhook.name);
const runtimeConfig = useRuntimeConfig();
const source = computed(() => `${runtimeConfig.public.baseUrl}/api/webhooks/${webhook.id}/${webhook.token}`);
</script>

<template>
  <v-list-item>
    <template #prepend>
      <v-avatar color="background">
        <v-icon icon="mdi-webhook" />
      </v-avatar>
    </template>
    <v-text-field
      v-model="name"
      label="Name"
      density="compact"
      hide-details
      @blur="updateWebhook(roomId, { id: webhook.id, name })"
    />
    <template #append>
      <StyledClipboardIconButton :source text="Copy Webhook URL" />
      <MessageModelRoomSettingsTypeWebhookRotateTokenButton :id="webhook.id" :room-id />
      <MessageModelRoomSettingsTypeWebhookDeleteDialogButton :room-id :webhook />
      <v-spacer />
      <MessageModelRoomSettingsTypeWebhookActiveSwitch :room-id :webhook />
    </template>
  </v-list-item>
</template>

<style scoped lang="scss">
:deep(.v-list-item__content) {
  overflow: visible;
}
</style>
