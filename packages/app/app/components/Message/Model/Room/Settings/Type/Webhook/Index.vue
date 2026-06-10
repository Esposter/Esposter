<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { WEBHOOK_MAX_LENGTH } from "#shared/services/message/constants";
import { useWebhookStore } from "@/store/message/room/webhook";
import { withFinalizerAsync } from "@esposter/shared";

interface WebhookProps {
  room: RoomInMessage;
}

const { room } = defineProps<WebhookProps>();
const webhookStore = useWebhookStore();
const { createWebhook, readWebhooks } = webhookStore;
const { items } = storeToRefs(webhookStore);
await readWebhooks(room.id);
const name = ref("");
const isLoading = ref(false);
</script>

<template>
  <div flex flex-col gap-y-4>
    <div flex gap-x-4 items-center justify-center>
      <v-text-field v-model="name" :disabled="isLoading" label="Name" density="compact" hide-details />
      <StyledButton
        :loading="isLoading"
        :disabled="!name || items.length >= WEBHOOK_MAX_LENGTH"
        @click="
          async () => {
            isLoading = true;
            await withFinalizerAsync(
              async () => {
                await createWebhook(room.id, { name });
              },
              () => {
                isLoading = false;
              },
            );
          }
        "
      >
        Create
      </StyledButton>
    </div>
    <div v-if="items.length >= WEBHOOK_MAX_LENGTH" text-red text-body-medium>
      You can only create up to {{ WEBHOOK_MAX_LENGTH }} webhook{{ WEBHOOK_MAX_LENGTH > 1 ? "s" : "" }}.
    </div>
    <MessageModelRoomSettingsTypeWebhookList :room-id="room.id" />
  </div>
</template>
