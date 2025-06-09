<script setup lang="ts">
import type { MessageEntity } from "#shared/models/db/message/MessageEntity";
import type { Item } from "@/models/shared/Item";

import { authClient } from "@/services/auth/authClient";
import { EmojiMenuItems } from "@/services/esbabbler/message/EmojiMenuItems";
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
const editMessageItem: Item = {
  icon: "mdi-pencil",
  onClick: () => {
    emit("update:update-mode", true);
  },
  shortTitle: "Edit",
  title: "Edit Message",
};
const replyItem: Item = {
  icon: "mdi-reply",
  onClick: () => {
    emit("update:reply", message.rowKey);
  },
  title: "Reply",
};
const forwardMessageItem: Item = {
  icon: "mdi-share",
  onClick: () => {
    emit("update:forward", message.rowKey);
  },
  title: "Forward",
};
// We only include menu items that will be part of our v-for to generate similar components
const menuItems = computed(() =>
  isEditable.value ? [editMessageItem, forwardMessageItem] : [replyItem, forwardMessageItem],
);
const updateMessageItems = computed(() =>
  isEditable.value ? [editMessageItem, replyItem, forwardMessageItem] : [replyItem, forwardMessageItem],
);
const deleteMessageItem = computed(() =>
  isCreator.value
    ? ({
        color: "error",
        icon: "mdi-delete",
        onClick: () => {
          emit("update:delete-mode", true);
        },
        title: "Delete Message",
      } as const satisfies Item)
    : undefined,
);
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
      <v-tooltip v-for="{ icon, shortTitle, title, onClick } of menuItems" :key="title" :text="shortTitle ?? title">
        <template #activator="{ props }">
          <v-btn m-0="!" rd-none="!" :icon size="small" :="props" @click="onClick" />
        </template>
      </v-tooltip>
      <EsbabblerModelMessageOptionsMenuMore
        :row-key="message.rowKey"
        :update-message-items
        :delete-message-item
        @update:menu="emit('update:menu', $event)"
        @update:select-emoji="emit('update:select-emoji', $event)"
      />
    </v-card-actions>
  </StyledCard>
</template>
