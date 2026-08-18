<script setup lang="ts">
import type { MessageEmojiMetadataEntity } from "#shared/models/db/message/metadata/MessageEmojiMetadataEntity";

interface MessageReactionsDialogRailProps {
  emojis: MessageEmojiMetadataEntity[];
}

const modelValue = defineModel<string>({ required: true });
const { emojis } = defineProps<MessageReactionsDialogRailProps>();
</script>

<template>
  <v-list w-28 density="compact">
    <v-list-item
      v-for="emoji of emojis"
      :key="emoji.rowKey"
      :active="emoji.emojiTag === modelValue"
      rd
      @click="modelValue = emoji.emojiTag"
    >
      <div flex gap-2 items-center>
        <span leading-none text-title-large>{{ emoji.emojiTag }}</span>
        <span font-bold text-body-small>{{ emoji.userIds.length }}</span>
      </div>
    </v-list-item>
  </v-list>
</template>
