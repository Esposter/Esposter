<script setup lang="ts">
import type { DraftItem } from "@/models/message/draftsAndSent/DraftItem";

import { useDataStore } from "@/store/message/data";
import { useInputStore } from "@/store/message/input";
import { MessageType } from "@esposter/db-schema";

interface MessageDraftsAndSentDraftSendButtonProps {
  draftItem: DraftItem;
}

const { draftItem } = defineProps<MessageDraftsAndSentDraftSendButtonProps>();
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
            if (
              await createMessage({
                files: [],
                message: draftItem.content,
                roomId: draftItem.room.id,
                type: MessageType.Message,
              })
            )
              clearDraft(draftItem.room.id);
          }
        "
      />
    </template>
  </v-tooltip>
</template>
