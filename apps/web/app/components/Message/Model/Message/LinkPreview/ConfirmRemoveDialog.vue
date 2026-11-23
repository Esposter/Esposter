<script setup lang="ts">
import { AwaitedReason } from "#src/models/shared/AwaitedReason";
import { useDataStore } from "#src/store/message/data";
import { useLinkPreviewDialogStore } from "#src/store/message/linkPreviewDialog";

const dataStore = useDataStore();
const { deleteLinkPreviewResponse, getSlice } = dataStore;
const linkPreviewDialogStore = useLinkPreviewDialogStore();
const { removingMessageId, removingRoomId } = storeToRefs(linkPreviewDialogStore);
const { isOpen, item: message } = useSingletonDialog(removingMessageId, () =>
  getSlice(removingRoomId.value).items.value.find(({ id }) => id === removingMessageId.value),
);
</script>

<template>
  <!-- The embed leaves the message once the room answers the removal, and a refused removal leaves it under the
    alert -->
  <UiConfirmDialog
    v-if="message"
    v-model="isOpen"
    :awaited-because="AwaitedReason.ServerDecidedOutcome"
    confirm-label="Remove All Embeds"
    title="Are you sure?"
    :confirm="() => deleteLinkPreviewResponse({ id: removingMessageId, roomId: removingRoomId })"
  >
    This will remove all embeds on this message for everyone.
  </UiConfirmDialog>
</template>
