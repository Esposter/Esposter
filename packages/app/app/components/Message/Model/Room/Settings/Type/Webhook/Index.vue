<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { DEFAULT_WEBHOOK_NAME, WEBHOOK_MAX_LENGTH } from "#shared/services/message/constants";
import { pluralize } from "#shared/util/text/pluralize";
import { useWebhookStore } from "@/store/message/room/webhook";
import { withFinalizerAsync } from "@esposter/shared";

interface Props {
  room: RoomInMessage;
}

const { room } = defineProps<Props>();
const webhookStore = useWebhookStore();
const { createWebhook, readWebhooks } = webhookStore;
const { items } = storeToRefs(webhookStore);
await readWebhooks(room.id);
const isPending = ref(false);
</script>

<!-- Discord's arrangement: one button creates the webhook and every field of it is edited on its own row, so the
     name is asked for where it is also changed rather than twice -->
<template>
  <div flex flex-col gap-y-4>
    <div flex justify-end>
      <StyledButton
        :loading="isPending"
        :disabled="items.length >= WEBHOOK_MAX_LENGTH"
        @click="
          async () => {
            isPending = true;
            await withFinalizerAsync(
              async () => {
                await createWebhook(room.id, { name: DEFAULT_WEBHOOK_NAME });
              },
              () => {
                isPending = false;
              },
            );
          }
        "
      >
        New Webhook
      </StyledButton>
    </div>
    <div v-if="items.length >= WEBHOOK_MAX_LENGTH" text-red text-body-medium>
      You can only create up to {{ WEBHOOK_MAX_LENGTH }} {{ pluralize("webhook", WEBHOOK_MAX_LENGTH) }}.
    </div>
    <MessageModelRoomSettingsTypeWebhookList :room-id="room.id" />
  </div>
</template>
