<script setup lang="ts">
import type { MessageEmojiMetadataEntity } from "#shared/models/db/message/metadata/MessageEmojiMetadataEntity";

import { getEmojiDescription } from "@/services/message/emoji/getEmojiDescription";
import { getReactorNames } from "@/services/message/emoji/getReactorNames";
import { useMemberStore } from "@/store/message/user/member";

interface MessageEmojiListItemHoverCardProps {
  emoji: MessageEmojiMetadataEntity;
}

const { emoji } = defineProps<MessageEmojiListItemHoverCardProps>();
defineEmits<{ open: [] }>();
const memberStore = useMemberStore();
const { getMemberName } = memberStore;
</script>

<template>
  <v-card px-4 py-3 flex flex-col gap-2 items-center>
    <span text-6xl leading-none>{{ emoji.emojiTag }}</span>
    <!-- The sentence is the affordance: no chrome of its own, only the pointer, exactly as Discord does it -->
    <button
      text-inherit
      text-center
      b-none
      bg-transparent
      cursor-pointer
      text-body-small
      type="button"
      @click="$emit('open')"
    >
      {{ getEmojiDescription(emoji.emojiTag) }} reacted by
      <span font-bold>{{ getReactorNames(emoji.userIds, getMemberName) }}</span>
    </button>
  </v-card>
</template>
