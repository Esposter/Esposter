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
const { rotatingId } = storeToRefs(webhookDialogStore);
</script>

<template>
  <UiIconButton
    label="Rotate token"
    :meaning="UiIconMeaning.Refresh"
    :variant="UiButtonVariant.Quiet"
    @click="rotatingId = id"
  />
</template>
