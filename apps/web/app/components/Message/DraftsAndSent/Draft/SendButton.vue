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

const props = defineProps<Props>();
const dataStore = useDataStore();
const { sendMessage } = dataStore;
const inputStore = useInputStore();
const { clearComposer } = inputStore;
// The draft is the composer's copy of its text until the send has its bubble, which then holds the text instead
const sendDraft = () => {
  const { room, threadRootId } = props.draftItem;
  const target = { roomId: room.id, threadRootId };
  sendMessage(
    {
      files: [],
      message: props.draftItem.content,
      replyToId: threadRootId || null,
      roomId: room.id,
      type: MessageType.Message,
    },
    undefined,
    target,
    () => clearComposer(target),
  );
};
</script>

<template>
  <UiIconButton
    label="Send message"
    :meaning="UiIconMeaning.Send"
    :variant="UiButtonVariant.Quiet"
    @click="sendDraft()"
  />
</template>
