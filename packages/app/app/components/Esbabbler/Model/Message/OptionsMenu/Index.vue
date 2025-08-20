<script setup lang="ts">
import type { MessageEntity } from "#shared/models/db/message/MessageEntity";

import { useMessageActionItems } from "@/composables/esbabbler/useMessageActionItems";
import { authClient } from "@/services/auth/authClient";
import { EmojiMenuItems } from "@/services/message/EmojiMenuItems";
import { EMOJI_TEXT } from "@/services/styled/constants";
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
  "update:reply": [rowKey: string];
  "update:select-emoji": [emoji: string];
  "update:update-mode": [value: true];
}>();
const { data: session } = await authClient.useSession(useFetch);
const isCreator = computed(() => session.value?.user.id === message.userId);
const isEditable = computed(() => isCreator.value && !message.isForward);
const {
  actionMessageItems,
  deleteMessageItem,
  updateMessageMenuItems: updateMessageItems,
} = useMessageActionItems(message, isEditable, isCreator, {
  onDeleteMode: () => emit("update:delete-mode", true),
  onForward: (rowKey) => emit("update:forward", rowKey),
  onReply: (rowKey) => emit("update:reply", rowKey),
  onUpdateMode: () => emit("update:update-mode", true),
});
</script>

<template>
  <StyledCard :card-props="{ elevation: isHovering ? 12 : 2, ...hoverProps }">
    <v-card-actions p-0="!" gap-0 min-h-auto="!">
      <v-tooltip v-for="emoji of EmojiMenuItems" :key="emoji">
        <template #activator="{ props }">
          <v-btn m-0="!" size-10="!" rd-none="!" icon :="props" @click="emit('update:select-emoji', emoji)">
            {{ emoji }}
          </v-btn>
        </template>
        <div flex flex-col text-center>
          <div font-bold>{{ unemojify(emoji) }}</div>
          <div>Click to react</div>
        </div>
      </v-tooltip>
      <v-divider thickness="2" vertical h-6 self-center />
      <StyledEmojiPicker
        :tooltip-props="{ text: EMOJI_TEXT }"
        :button-props="{ size: 'small' }"
        :button-attrs="{ 'rd-none': '!' }"
        @update:menu="emit('update:menu', $event)"
        @select="emit('update:select-emoji', $event)"
      />
      <EsbabblerModelMessageOptionsMenuItems
        :message
        @update:update-mode="emit('update:update-mode', true)"
        @update:reply="emit('update:reply', $event)"
        @update:forward="emit('update:forward', $event)"
      />
      <EsbabblerModelMessageOptionsMenuMore
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
