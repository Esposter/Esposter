<script setup lang="ts">
import type { MessageEntity } from "@esposter/db-schema";

import { EmojiMenuItems } from "@/services/message/emoji/EmojiMenuItems";
import { getEmojiDescription } from "@/services/message/emoji/getEmojiDescription";

interface OptionsMenuProps {
  hoverProps?: Record<string, unknown>;
  isHovering?: boolean | null;
  message: MessageEntity;
}

const { hoverProps, isHovering, message } = defineProps<OptionsMenuProps>();
const emit = defineEmits<{ "update:menu": [value: boolean] }>();
const isCreator = await useIsCreator(() => message);
const isEditable = computed(() => isCreator.value && !message.isForward);
const { actionMessageItems, deleteMessageItem, updateMessageItems, updateMessageMenuItems } = useMessageActionItems(
  message,
  isEditable,
  isCreator,
);
const selectEmoji = useSelectEmoji(message);
const cardProps = computed(() => ({ elevation: isHovering ? 12 : 2, ...hoverProps }));
</script>

<template>
  <StyledCard :card-props>
    <v-card-actions p-0 gap-0 min-h-auto>
      <v-tooltip v-for="emoji of EmojiMenuItems" :key="emoji">
        <template #activator="{ props }">
          <v-btn :text="emoji" icon tile m-0 size-10 :="props" @click="selectEmoji(emoji)" />
        </template>
        <div text-center flex flex-col>
          <div font-bold>{{ getEmojiDescription(emoji) }}</div>
          <div>Click to react</div>
        </div>
      </v-tooltip>
      <v-divider thickness="2" vertical h-6 self-center />
      <MessageModelMessageEmojiPicker
        :button-props="{ size: 'small', tile: true }"
        @update:menu="emit('update:menu', $event)"
        @select="selectEmoji"
      />
      <MessageModelMessageOptionsMenuItems :items="updateMessageItems" />
      <MessageModelMessageOptionsMenuMore
        :row-key="message.rowKey"
        :action-message-items
        :delete-message-item
        :update-message-menu-items
        @update:menu="emit('update:menu', $event)"
        @update:select-emoji="selectEmoji"
      />
    </v-card-actions>
  </StyledCard>
</template>
