<script setup lang="ts">
import type { WebhookInMessage } from "@esposter/db-schema";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useWebhookDialogStore } from "@/store/message/room/webhookDialog";

interface Props {
  id: WebhookInMessage["id"];
}

const { id } = defineProps<Props>();
const webhookDialogStore = useWebhookDialogStore();
const { deletingId } = storeToRefs(webhookDialogStore);
</script>

<template>
  <UiIconButton
    label="Delete webhook"
    :meaning="UiIconMeaning.Delete"
    :variant="UiButtonVariant.Quiet"
    @click="deletingId = id"
  />
</template>
