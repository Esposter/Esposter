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
  <MessageDraftsAndSentActionButton
    icon="mdi-send-outline"
    text="Send message"
    @click="
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
