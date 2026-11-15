<script setup lang="ts">
import type { DraftItem } from "#src/models/message/draftsAndSent/DraftItem";

import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { useDataStore } from "#src/store/message/data";
import { useInputStore } from "#src/store/message/input/index";
import { MessageType } from "@esposter/db-schema";

interface Props {
  draftItem: DraftItem;
}

defineProps<Props>();
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
            replyToId: draftItem.threadRootId || null,
            roomId: draftItem.room.id,
            type: MessageType.Message,
          })
        )
          clearComposer({ roomId: draftItem.room.id, threadRootId: draftItem.threadRootId });
      }
    "
  />
</template>
