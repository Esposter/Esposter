<script setup lang="ts">
import type { MessageEntity } from "@esposter/db-schema";

import { authClient } from "@/services/auth/authClient";
import { useEmojiStore } from "@/store/message/emoji";
import { useRoomEmojiStore } from "@/store/message/room/emoji";

interface MessageEmojiListProps {
  isPreview?: boolean;
  message: MessageEntity;
}

const { isPreview, message } = defineProps<MessageEmojiListProps>();
const { data: session } = await authClient.useSession(useFetch);
const emojiStore = useEmojiStore();
const { getEmojis } = emojiStore;
const emojis = computed(() => getEmojis(message.rowKey));
const selectEmoji = useSelectEmoji(message);
const roomEmojiStore = useRoomEmojiStore();
const { customEmojis } = storeToRefs(roomEmojiStore);
</script>

<template>
  <div v-if="session && emojis.length > 0" flex flex-wrap gap-1 items-center>
    <MessageModelMessageEmojiListItem v-for="emoji of emojis" :key="emoji.rowKey" :emoji />
    <StyledEmojiPicker
      v-if="!isPreview"
      :custom-emojis
      :button-props="{ size: 'small', density: 'comfortable' }"
      @select="selectEmoji"
    />
  </div>
</template>
