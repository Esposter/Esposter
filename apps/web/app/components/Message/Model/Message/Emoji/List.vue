<script setup lang="ts">
import type { ClientMessage } from "@/models/message/ClientMessage";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { useEmojiStore } from "@/store/message/emoji";

interface Props {
  isPreview?: boolean;
  message: ClientMessage;
}

const { message } = defineProps<Props>();
const { data: session } = await useAuthSession();
const emojiStore = useEmojiStore();
const { getEmojis } = emojiStore;
const emojis = computed(() => getEmojis(message.roomId, message.id));
const selectEmoji = useSelectEmoji(message);
</script>

<template>
  <div v-if="session && emojis.length > 0" flex flex-wrap gap-1 items-center>
    <MessageModelMessageEmojiListItem v-for="emoji of emojis" :key="emoji.emojiTag" :emoji :room-id="message.roomId" />
    <MessageModelMessageEmojiPicker
      v-if="!isPreview"
      :variant="UiButtonVariant.Field"
      ui-pill
      @select="(emoji) => selectEmoji(emoji)"
    />
  </div>
</template>
