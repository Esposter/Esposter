<script setup lang="ts">
import type { RoomInMessage, WebhookInMessage } from "@esposter/db-schema";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useWebhookStore } from "@/store/message/room/webhook";

interface Props {
  roomId: RoomInMessage["id"];
  webhook: WebhookInMessage;
}

const { roomId, webhook } = defineProps<Props>();
const runtimeConfig = useRuntimeConfig();
const webhookStore = useWebhookStore();
const { updateWebhook } = webhookStore;
const editedName = ref(webhook.name);
</script>

<!-- Discord's arrangement: every field of a webhook is edited on its own row, its name as the field that renames it,
     then what is done to it, and whether it posts at all at the end -->
<template>
  <div role="listitem" flex gap-2 items-center>
    <UiIcon :meaning="UiIconMeaning.Webhook" text-muted />
    <UiTextField
      v-model="editedName"
      is-label-hidden
      label="Webhook name"
      flex-1
      min-w-0
      @focusout="updateWebhook(roomId, { id: webhook.id, name: editedName })"
    />
    <UiCopyButton
      :source="`${runtimeConfig.public.baseUrl}/api/webhooks/${webhook.id}/${webhook.token}`"
      :variant="UiButtonVariant.Quiet"
    />
    <MessageModelRoomSettingsTypeWebhookRotateTokenButton :id="webhook.id" :room-id />
    <MessageModelRoomSettingsTypeWebhookDeleteButton :id="webhook.id" />
    <MessageModelRoomSettingsTypeWebhookActiveSwitch :room-id :webhook />
  </div>
</template>
