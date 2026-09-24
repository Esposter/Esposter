<script setup lang="ts">
import type { DraftItem } from "@/models/message/draftsAndSent/DraftItem";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
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
  <UiIconButton
    label="Send message"
    :meaning="UiIconMeaning.Send"
    :variant="UiButtonVariant.Quiet"
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
