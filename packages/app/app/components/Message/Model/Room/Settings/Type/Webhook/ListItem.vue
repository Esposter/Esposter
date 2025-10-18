<script setup lang="ts">
import type { Webhook } from "@esposter/db-schema";

import { useWebhookStore } from "@/store/message/webhook";

interface ListItemProps {
  webhook: Webhook;
}

const { webhook } = defineProps<ListItemProps>();
const webhookStore = useWebhookStore();
const { updateWebhook } = webhookStore;
const name = ref(webhook.name);
const functionAppBaseUrl = useFunctionAppBaseUrl();
const source = computed(() => `${functionAppBaseUrl}/api/webhooks/${webhook.id}/${webhook.token}`);
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
      @blur="updateWebhook({ id: webhook.id, name })"
    />
    <template #append>
      <StyledClipboardIconButton :source text="Copy Webhook URL" />
      <MessageModelRoomSettingsTypeWebhookRotateTokenButton :id="webhook.id" />
      <MessageModelRoomSettingsTypeWebhookDeleteDialogButton :webhook />
      <v-spacer />
      <MessageModelRoomSettingsTypeWebhookActiveSwitch :webhook />
    </template>
  </v-list-item>
</template>

<style scoped lang="scss">
:deep(.v-list-item__content) {
  overflow: visible;
}
</style>
