<script setup lang="ts">
import type { DraftItem } from "@/models/message/draftsSent/DraftItem";

import { useDataStore } from "@/store/message/data";
import { useInputStore } from "@/store/message/input";
import { MessageType } from "@esposter/db-schema";

interface MessageDraftsSentDraftSendButtonProps {
  draftItem: DraftItem;
}

const { draftItem } = defineProps<MessageDraftsSentDraftSendButtonProps>();
const dataStore = useDataStore();
const { createMessage } = dataStore;
const inputStore = useInputStore();
const { clearDraft } = inputStore;
</script>

<template>
  <v-tooltip text="Send message">
    <template #activator="{ props: tooltipProps }">
      <v-btn
        :="tooltipProps"
        density="comfortable"
        icon="mdi-send-outline"
        size="small"
        variant="text"
        @click.stop="
          async () => {
            await createMessage({
              files: [],
              message: draftItem.content,
              roomId: draftItem.room.id,
              type: MessageType.Message,
            });
            clearDraft(draftItem.room.id);
          }
        "
      />
    </template>
  </v-tooltip>
</template>
