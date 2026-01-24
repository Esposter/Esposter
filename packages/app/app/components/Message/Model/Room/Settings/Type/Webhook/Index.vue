<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { WEBHOOK_MAX_LENGTH } from "#shared/services/message/constants";
import { useWebhookStore } from "@/store/message/webhook";

interface WebhookSettingsProps {
  roomId: RoomInMessage["id"];
}

const { roomId } = defineProps<WebhookSettingsProps>();
const webhookStore = useWebhookStore();
const { createWebhook, readWebhooks } = webhookStore;
const { items } = storeToRefs(webhookStore);
await readWebhooks(roomId);
const name = ref("");
const isLoading = ref(false);
</script>

<template>
  <div flex flex-col gap-y-4>
    <div flex justify-center items-center gap-x-4>
      <v-text-field v-model="name" :disabled="isLoading" label="Name" density="compact" hide-details />
      <StyledButton
        :loading="isLoading"
        :disabled="!name || items.length >= WEBHOOK_MAX_LENGTH"
        @click="
          async () => {
            isLoading = true;
            await createWebhook(roomId, { name });
            isLoading = false;
          }
        "
      >
        Create
      </StyledButton>
    </div>
    <div v-if="items.length >= WEBHOOK_MAX_LENGTH" text-sm text-red>
      You can only create up to {{ WEBHOOK_MAX_LENGTH }} webhook{{ WEBHOOK_MAX_LENGTH > 1 ? "s" : "" }}.
    </div>
    <MessageModelRoomSettingsTypeWebhookList :room-id />
  </div>
</template>
