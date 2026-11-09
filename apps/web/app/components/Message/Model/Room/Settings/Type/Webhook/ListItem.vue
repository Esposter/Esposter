<script setup lang="ts">
import type { RoomInMessage, WebhookInMessage } from "@esposter/db-schema";

import { WebhookDialogAction } from "@/models/message/room/WebhookDialogAction";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useWebhookStore } from "@/store/message/room/webhook";
import { selectWebhookInMessageSchema, WEBHOOK_NAME_MAX_LENGTH } from "@esposter/db-schema";

interface Props {
  roomId: RoomInMessage["id"];
  webhook: WebhookInMessage;
}

const { webhook } = defineProps<Props>();
const runtimeConfig = useRuntimeConfig();
const webhookStore = useWebhookStore();
const { updateWebhook } = webhookStore;
const { draft: editedName, isDirty, settle } = useStoredDraft(() => webhook.name);
// The name is judged by the schema the server takes it by, so a blank or over-long one says so rather than being sent
const nameRules = [
  (value: string) =>
    selectWebhookInMessageSchema.shape.name.safeParse(value).success ||
    `You must enter between 1 and ${WEBHOOK_NAME_MAX_LENGTH} characters`,
];
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
      :rules="nameRules"
      @focusout="
        async () => {
          if (!isDirty || !selectWebhookInMessageSchema.shape.name.safeParse(editedName).success) return;

          await updateWebhook(roomId, { id: webhook.id, name: editedName });
          settle();
        }
      "
    />
    <UiCopyButton
      :source="`${runtimeConfig.public.baseUrl}/api/webhooks/${webhook.id}/${webhook.token}`"
      :variant="UiButtonVariant.Quiet"
    />
    <MessageModelRoomSettingsTypeWebhookActionButton :id="webhook.id" :action="WebhookDialogAction.RotateToken" />
    <MessageModelRoomSettingsTypeWebhookActionButton :id="webhook.id" :action="WebhookDialogAction.Delete" />
    <MessageModelRoomSettingsTypeWebhookActiveSwitch :room-id :webhook />
  </div>
</template>
