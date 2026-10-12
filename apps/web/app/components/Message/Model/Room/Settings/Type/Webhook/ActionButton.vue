<script setup lang="ts">
import type { WebhookDialogAction } from "@/models/message/room/WebhookDialogAction";
import type { WebhookInMessage } from "@esposter/db-schema";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { WebhookDialogActionMetaMap } from "@/services/message/room/WebhookDialogActionMetaMap";
import { useWebhookDialogStore } from "@/store/message/room/webhookDialog";

interface Props {
  action: WebhookDialogAction;
  id: WebhookInMessage["id"];
}

const { action, id } = defineProps<Props>();
const webhookDialogStore = useWebhookDialogStore();
const { getSelectedId } = webhookDialogStore;
const selectedId = getSelectedId(action);
const { label, meaning } = WebhookDialogActionMetaMap[action];
</script>

<template>
  <UiIconButton :label :meaning :variant="UiButtonVariant.Quiet" @click="selectedId = id" />
</template>
