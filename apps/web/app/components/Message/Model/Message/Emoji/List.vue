<script setup lang="ts">
import type { MessageEntity } from "@esposter/db-schema";

import { authClient } from "@/services/auth/authClient";
import { useEmojiStore } from "@/store/message/emoji";

interface Props {
  isPreview?: boolean;
  message: MessageEntity;
}

const { isPreview, message } = defineProps<Props>();
const { data: session } = await authClient.useSession(useFetch);
const emojiStore = useEmojiStore();
const { getEmojis } = emojiStore;
const emojis = computed(() => getEmojis(message.rowKey));
const selectEmoji = useSelectEmoji(message);
</script>

<template>
  <div v-if="session && emojis.length > 0" flex flex-wrap gap-1 items-center>
    <MessageModelMessageEmojiListItem v-for="emoji of emojis" :key="emoji.rowKey" :emoji />
    <MessageModelMessageEmojiPicker
      v-if="!isPreview"
      :button-props="{ size: 'small', density: 'comfortable' }"
      @select="selectEmoji"
    />
  </div>
</template>
