<script setup lang="ts">
import type { MessageEntity } from "@esposter/db-schema";

import { authClient } from "@/services/auth/authClient";
import { EmojiMenuItems } from "@/services/message/emoji/EmojiMenuItems";
import { EMOJI_PICKER_TOOLTIP_TEXT } from "@/services/styled/constants";
import { unemojify } from "node-emoji";

interface MessageOptionsMenuProps {
  hoverProps?: Record<string, unknown>;
  isHovering?: boolean | null;
  message: MessageEntity;
}

const { hoverProps, isHovering, message } = defineProps<MessageOptionsMenuProps>();
const emit = defineEmits<{
  "update:delete-mode": [value: true];
  "update:forward": [rowKey: string];
  "update:menu": [value: boolean];
  "update:pin": [value: true];
  "update:reply": [rowKey: string];
  "update:select-emoji": [emoji: string];
  "update:update-mode": [value: true];
}>();
const { data: session } = await authClient.useSession(useFetch);
const creator = useCreator(() => message);
const isCreator = computed(() => creator.value?.id === session.value?.user.id);
const isEditable = computed(() => isCreator.value && !message.isForward);
const {
  actionMessageItems,
  deleteMessageItem,
  updateMessageMenuItems: updateMessageItems,
} = useMessageActionItems(message, isEditable, isCreator, {
  onDeleteMode: () => emit("update:delete-mode", true),
  onForward: (rowKey) => emit("update:forward", rowKey),
  onPin: (value) => emit("update:pin", value),
  onReply: (rowKey) => emit("update:reply", rowKey),
  onUpdateMode: () => emit("update:update-mode", true),
});
</script>

<template>
  <StyledCard :card-props="{ elevation: isHovering ? 12 : 2, ...hoverProps }">
    <v-card-actions p-0="!" gap-0 min-h-auto="!">
      <v-tooltip v-for="emoji of EmojiMenuItems" :key="emoji">
        <template #activator="{ props }">
          <v-btn m-0 size-10="!" :text="emoji" icon tile :="props" @click="emit('update:select-emoji', emoji)" />
        </template>
        <div flex flex-col text-center>
          <div font-bold>{{ unemojify(emoji) }}</div>
          <div>Click to react</div>
        </div>
      </v-tooltip>
      <v-divider thickness="2" vertical h-6 self-center />
      <StyledEmojiPicker
        :tooltip-props="{ text: EMOJI_PICKER_TOOLTIP_TEXT }"
        :button-props="{ size: 'small', tile: true }"
        @update:menu="emit('update:menu', $event)"
        @select="emit('update:select-emoji', $event)"
      />
      <MessageModelMessageOptionsMenuItems
        :message
        @update:pin="emit('update:pin', $event)"
        @update:forward="emit('update:forward', $event)"
        @update:reply="emit('update:reply', $event)"
        @update:update-mode="emit('update:update-mode', true)"
      />
      <MessageModelMessageOptionsMenuMore
        :row-key="message.rowKey"
        :action-message-items
        :delete-message-item
        :update-message-items
        @update:menu="emit('update:menu', $event)"
        @update:select-emoji="emit('update:select-emoji', $event)"
      />
    </v-card-actions>
  </StyledCard>
</template>
