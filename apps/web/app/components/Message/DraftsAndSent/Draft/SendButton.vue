<script setup lang="ts">
import type { DraftItem } from "@/models/message/draftsAndSent/DraftItem";

import { useDataStore } from "@/store/message/data";
import { useInputStore } from "@/store/message/input";
import { MessageType } from "@esposter/db-schema";

interface Props {
  draftItem: DraftItem;
}

const { draftItem } = defineProps<Props>();
const dataStore = useDataStore();
const { createMessage } = dataStore;
const inputStore = useInputStore();
const { clearComposer } = inputStore;
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
            replyRowKey: draftItem.threadRootRowKey,
            roomId: draftItem.room.id,
            type: MessageType.Message,
          })
        )
          clearComposer({ roomId: draftItem.room.id, threadRootRowKey: draftItem.threadRootRowKey });
      }
    "
  />
</template>
