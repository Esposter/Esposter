<script setup lang="ts">
import type { WebhookInMessage } from "@esposter/db-schema";

import { useWebhookDialogStore } from "@/store/message/room/webhookDialog";

interface WebhookDeleteButtonProps {
  id: WebhookInMessage["id"];
}

const { id } = defineProps<WebhookDeleteButtonProps>();
const webhookDialogStore = useWebhookDialogStore();
const { deletingId } = storeToRefs(webhookDialogStore);
</script>

<template>
  <StyledTooltipIconButton
    :button-props="{ size: 'small' }"
    icon="mdi-delete"
    text="Delete Webhook"
    @click="deletingId = id"
  />
</template>
