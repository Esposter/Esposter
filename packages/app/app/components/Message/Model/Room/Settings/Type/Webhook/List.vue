<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { useWebhookStore } from "@/store/message/room/webhook";

interface Props {
  roomId: RoomInMessage["id"];
}

const { roomId } = defineProps<Props>();
const webhookStore = useWebhookStore();
const { items } = storeToRefs(webhookStore);
</script>

<template>
  <v-list>
    <v-list-subheader>Webhooks</v-list-subheader>
    <v-list-item v-if="items.length === 0">
      <v-list-item-title>No webhooks created</v-list-item-title>
    </v-list-item>
    <template v-else>
      <MessageModelRoomSettingsTypeWebhookListItem v-for="webhook of items" :key="webhook.id" :room-id :webhook />
    </template>
    <MessageModelRoomSettingsTypeWebhookConfirmDeleteDialog :room-id />
  </v-list>
</template>
