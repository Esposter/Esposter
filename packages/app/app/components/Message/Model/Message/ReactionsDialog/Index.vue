<script setup lang="ts">
import { useMessageDialogStore } from "@/store/message/dialog";
import { useEmojiStore } from "@/store/message/emoji";

const messageDialogStore = useMessageDialogStore();
const { reactionsRowKey } = storeToRefs(messageDialogStore);
const emojiStore = useEmojiStore();
const { getEmojis } = emojiStore;
// Resolved through the primitive rather than a computed of our own, so a message whose last reaction is
// Removed while this is open closes with it instead of showing an empty pane
const { isOpen, item: emojis } = useSingletonDialog(reactionsRowKey, () => {
  const messageEmojis = getEmojis(reactionsRowKey.value);
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
  <StyledDialog v-model="isOpen" :card-props="{ title: 'Reactions' }" :dialog-props="{ maxWidth: '36rem' }">
    <div v-if="selectedEmoji" flex gap-2 min-h-64>
      <MessageModelMessageReactionsDialogRail
        :emojis="displayEmojis"
        :model-value="selectedEmoji.emojiTag"
        @update:model-value="selectedEmojiTag = $event"
      />
      <v-divider vertical />
      <v-list flex-1>
        <MessageModelMessageReactionsDialogUserListItem
          v-for="userId of selectedEmoji.userIds"
          :key="userId"
          :user-id
        />
      </v-list>
    </div>
  </StyledDialog>
</template>
