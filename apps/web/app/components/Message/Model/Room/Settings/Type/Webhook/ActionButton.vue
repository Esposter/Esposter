<script setup lang="ts">
import type { WebhookDialogAction } from "#src/models/message/room/WebhookDialogAction";
import type { PublicWebhookInMessage } from "@esposter/db-schema";

import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { WebhookDialogActionMetaMap } from "#src/services/message/room/WebhookDialogActionMetaMap";
import { useWebhookDialogStore } from "#src/store/message/room/webhookDialog";

interface Props {
  action: WebhookDialogAction;
  id: PublicWebhookInMessage["id"];
}

const { action } = defineProps<Props>();
const webhookDialogStore = useWebhookDialogStore();
const { getSelectedId } = webhookDialogStore;
const selectedId = getSelectedId(action);
const { label, meaning } = WebhookDialogActionMetaMap[action];
</script>

<template>
  <UiIconButton :label :meaning :variant="UiButtonVariant.Quiet" @click="selectedId = id" />
</template>
