<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useWebhookStore } from "@/store/message/room/webhook";

interface Props {
  id: string;
  roomId: RoomInMessage["id"];
}

const { id, roomId } = defineProps<Props>();
const webhookStore = useWebhookStore();
const { rotateToken } = webhookStore;
</script>

<template>
  <UiIconButton
    label="Rotate token"
    :meaning="UiIconMeaning.Refresh"
    :variant="UiButtonVariant.Quiet"
    @click="rotateToken(roomId, { id })"
  />
</template>
