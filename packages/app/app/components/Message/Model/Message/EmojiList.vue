<script setup lang="ts">
import type { MessageEntity } from "@esposter/db-schema";

import { authClient } from "@/services/auth/authClient";
import { EMOJI_PICKER_TOOLTIP_TEXT } from "@/services/styled/constants";
import { useEmojiStore } from "@/store/message/emoji";
import { emojify } from "node-emoji";

interface MessageEmojiListProps {
  isPreview?: boolean;
  message: MessageEntity;
}

const { isPreview, message } = defineProps<MessageEmojiListProps>();
const { data: session } = await authClient.useSession(useFetch);
const emojiStore = useEmojiStore();
const { deleteEmoji, getEmojis, updateEmoji } = emojiStore;
const emojis = computed(() =>
  getEmojis(message.rowKey).map(({ emojiTag, partitionKey, rowKey, userIds }) => ({
    emoji: emojify(emojiTag),
    isReacted: Boolean(session.value && userIds.includes(session.value.user.id)),
    partitionKey,
    rowKey,
    userIds,
  })),
);
const hasEmojis = computed(() => emojis.value.length > 0);
const selectEmoji = await useSelectEmoji(message);
</script>

<template>
  <div v-if="session && hasEmojis" flex flex-wrap gap-1 items-center>
    <div
      v-for="{ partitionKey, rowKey, userIds, isReacted, emoji } of emojis"
      :key="rowKey"
      :class="
        isReacted
          ? ['bg-infoOpacity10', 'b-info']
          : ['bg-backgroundOpacity80', 'b-transparent', 'hover:bg-surfaceOpacity80', 'hover:b-border']
      "
      px-2
      b-1
      rd-full
      b-solid
      flex
      w-fit
      cursor-pointer
      shadow-md
      origin-center
      items-center
      z-1
      active:scale-95
      @click="
        isReacted && userIds.length === 1
          ? deleteEmoji({ partitionKey, rowKey, messageRowKey: message.rowKey })
          : updateEmoji({
              partitionKey,
              rowKey,
              messageRowKey: message.rowKey,
              userIds,
            })
      "
    >
      {{ emoji }}
      <span pl-1 text-title-small>{{ userIds.length }}</span>
    </div>
    <StyledEmojiPicker
      v-if="!isPreview"
      :tooltip-props="{ text: EMOJI_PICKER_TOOLTIP_TEXT }"
      :button-props="{ size: 'small', density: 'comfortable' }"
      @select="selectEmoji"
    />
  </div>
</template>
