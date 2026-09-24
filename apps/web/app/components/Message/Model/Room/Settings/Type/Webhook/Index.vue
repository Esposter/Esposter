<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { DEFAULT_WEBHOOK_NAME, WEBHOOK_MAX_LENGTH } from "#shared/services/message/constants";
import { pluralize } from "#shared/util/text/pluralize";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
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
  <div py-4 flex flex-col gap-4 ui-body>
    <div flex gap-2 items-center>
      <p text-muted flex-1 min-w-0>Webhooks let other services post messages into this room.</p>
      <UiButton
        :disabled="isPending || items.length >= WEBHOOK_MAX_LENGTH"
        :variant="UiButtonVariant.Accent"
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
        <UiSpinner v-if="isPending" />
        New webhook
      </UiButton>
    </div>
    <UiAlert v-if="items.length >= WEBHOOK_MAX_LENGTH" status="warning">
      You can only create up to {{ WEBHOOK_MAX_LENGTH }} {{ pluralize("webhook", WEBHOOK_MAX_LENGTH) }}.
    </UiAlert>
    <MessageModelRoomSettingsTypeWebhookList :room-id="room.id" />
  </div>
</template>
