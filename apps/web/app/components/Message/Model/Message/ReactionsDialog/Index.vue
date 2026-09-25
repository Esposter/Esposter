<script setup lang="ts">
import { useMessageDialogStore } from "@/store/message/dialog";
import { useEmojiStore } from "@/store/message/emoji";

const messageDialogStore = useMessageDialogStore();
const { reactionsRoomId, reactionsRowKey } = storeToRefs(messageDialogStore);
const emojiStore = useEmojiStore();
const { getEmojis } = emojiStore;
// Resolved through the primitive rather than a computed of our own, so a message whose last reaction is
// Removed while this is open closes with it instead of showing an empty pane
const { isOpen, item: emojis } = useSingletonDialog(reactionsRowKey, () => {
  const messageEmojis = getEmojis(reactionsRoomId.value, reactionsRowKey.value);
  return messageEmojis.length > 0 ? messageEmojis : undefined;
});
const selectedEmojiTag = ref("");
// Most-reacted first, sorted at display time. The rail's selection is derived rather than assigned on open,
// So a reaction that overtakes another — or disappears entirely — never leaves the rail pointing at nothing
const displayEmojis = computed(() =>
  (emojis.value ?? []).toSorted((firstEmoji, secondEmoji) => secondEmoji.userIds.length - firstEmoji.userIds.length),
);
const selectedEmoji = computed(
  () => displayEmojis.value.find(({ emojiTag }) => emojiTag === selectedEmojiTag.value) ?? displayEmojis.value[0],
);
</script>

<template>
  <!-- High, as a dialog whose rail swaps panels of other lengths stands, so the rail never moves under the pointer -->
  <UiDialog v-model="isOpen" title="Reactions" w="[min(36rem,90vw)]">
    <div v-if="selectedEmoji" p-3 flex gap-3 min-h-64 of-hidden>
      <MessageModelMessageReactionsDialogRail
        :emojis="displayEmojis"
        :model-value="selectedEmoji.emojiTag"
        @update:model-value="selectedEmojiTag = $event"
      />
      <div aria-label="Reacted by" role="list" flex flex-1 flex-col min-w-0 of-y-auto>
        <MessageModelMessageReactionsDialogUserListItem
          v-for="userId of selectedEmoji.userIds"
          :key="userId"
          :user-id
        />
      </div>
    </div>
  </UiDialog>
</template>
