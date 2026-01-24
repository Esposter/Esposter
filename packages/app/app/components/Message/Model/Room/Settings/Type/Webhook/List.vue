<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { useWebhookStore } from "@/store/message/webhook";

interface WebhookListProps {
  roomId: RoomInMessage["id"];
}

const { roomId } = defineProps<WebhookListProps>();
const webhookStore = useWebhookStore();
const { items } = storeToRefs(webhookStore);
</script>

<template>
  <v-list>
    <v-list-subheader>Webhooks</v-list-subheader>
    <MessageModelRoomSettingsTypeWebhookNoData v-if="items.length === 0" />
    <template v-else>
      <MessageModelRoomSettingsTypeWebhookListItem v-for="webhook of items" :key="webhook.id" :room-id :webhook />
    </template>
  </v-list>
</template>
