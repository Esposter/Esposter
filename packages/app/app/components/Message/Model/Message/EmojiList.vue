<script setup lang="ts">
import type { MessageEntity } from "#shared/models/db/message/MessageEntity";

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
const { backgroundOpacity80, border, info, infoOpacity10, surfaceOpacity80 } = useColors();
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
  <div v-if="session && hasEmojis" flex items-center flex-wrap gap-1>
    <div
      v-for="{ partitionKey, rowKey, userIds, isReacted, emoji } of emojis"
      :key="rowKey"
      :class="isReacted ? 'reacted' : 'not-reacted'"
      rd-full="!"
      flex
      items-center
      px-2
      shadow-md
      cursor-pointer
      z-1
      w-fit
      origin-center
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
      <span class="text-subtitle-2" pl-1>{{ userIds.length }}</span>
    </div>
    <StyledEmojiPicker
      v-if="!isPreview"
      :tooltip-props="{ text: EMOJI_PICKER_TOOLTIP_TEXT }"
      :button-props="{ size: 'small', density: 'comfortable' }"
      @select="selectEmoji"
    />
  </div>
</template>

<style scoped lang="scss">
.reacted {
  background-color: v-bind(infoOpacity10);
  border: $border-width-root $border-style-root v-bind(info);
}

.not-reacted {
  background-color: v-bind(backgroundOpacity80);
  border: $border-width-root $border-style-root transparent;

  &:hover {
    background-color: v-bind(surfaceOpacity80);
    border: $border-width-root $border-style-root v-bind(border);
  }
}
</style>
