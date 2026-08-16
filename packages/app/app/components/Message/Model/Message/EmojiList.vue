<script setup lang="ts">
import type { MessageEntity } from "@esposter/db-schema";

import { authClient } from "@/services/auth/authClient";
import { EMOJI_PICKER_TOOLTIP_TEXT } from "@/services/styled/constants";
import { useEmojiStore } from "@/store/message/emoji";

interface MessageEmojiListProps {
  isPreview?: boolean;
  message: MessageEntity;
}

const { isPreview, message } = defineProps<MessageEmojiListProps>();
const { data: session } = await authClient.useSession(useFetch);
const emojiStore = useEmojiStore();
const { getEmojis } = emojiStore;
const emojis = computed(() => getEmojis(message.rowKey));
const selectEmoji = await useSelectEmoji(message);
</script>

<template>
  <div v-if="session && emojis.length > 0" flex flex-wrap gap-1 items-center>
    <MessageModelMessageEmojiListItem v-for="emoji of emojis" :key="emoji.rowKey" :emoji />
    <StyledEmojiPicker
      v-if="!isPreview"
      :tooltip-props="{ text: EMOJI_PICKER_TOOLTIP_TEXT }"
      :button-props="{ size: 'small', density: 'comfortable' }"
      @select="selectEmoji"
    />
  </div>
</template>
