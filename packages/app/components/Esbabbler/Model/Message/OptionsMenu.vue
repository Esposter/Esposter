<script setup lang="ts">
import type { MessageEntity } from "@/shared/models/esbabbler/message";

import { useEmojiStore } from "@/store/esbabbler/emoji";
import { unemojify } from "node-emoji";
import { mergeProps } from "vue";

interface Item {
  color?: string;
  icon: string;
  onClick: (event: KeyboardEvent | MouseEvent) => void;
  title: string;
}

interface MessageOptionsMenuProps {
  hoverProps?: Record<string, unknown>;
  isHovering?: boolean | null;
  message: MessageEntity;
}

const { hoverProps, isHovering, message } = defineProps<MessageOptionsMenuProps>();
const emit = defineEmits<{
  "update:delete-mode": [value: true];
  "update:menu": [value: boolean];
  "update:update-mode": [value: true];
}>();
const { session } = useAuth();
const emojiStore = useEmojiStore();
const { createEmoji, deleteEmoji, getEmojiList, updateEmoji } = emojiStore;
const emojis = computed(() => getEmojiList(message.rowKey));
const isCreator = computed(() => session.value?.user.id === message.userId);
const items = computed(() => {
  if (!isCreator.value) return [];

  const result: Item[] = [];
  result.unshift({
    icon: "mdi-pencil",
    onClick: () => {
      emit("update:update-mode", true);
    },
    title: "Edit Message",
  });
  result.push({
    color: "error",
    icon: "mdi-delete",
    onClick: () => {
      emit("update:delete-mode", true);
    },
    title: "Delete Message",
  });
  return result;
});

const onSelect = async (emoji: string) => {
  if (!session.value) return;

  const emojiTag = unemojify(emoji);
  const foundEmoji = emojis.value.find((e) => e.emojiTag === emojiTag);
  if (!foundEmoji) {
    await createEmoji({
      emojiTag,
      messageRowKey: message.rowKey,
      partitionKey: message.partitionKey,
    });
    return;
  }

  if (foundEmoji.userIds.includes(session.value.user.id)) {
    if (foundEmoji.userIds.length === 1)
      await deleteEmoji({
        messageRowKey: foundEmoji.messageRowKey,
        partitionKey: foundEmoji.partitionKey,
        rowKey: foundEmoji.rowKey,
      });
    else
      await updateEmoji({
        messageRowKey: foundEmoji.messageRowKey,
        partitionKey: foundEmoji.partitionKey,
        rowKey: foundEmoji.rowKey,
        userIds: foundEmoji.userIds.filter((userId) => userId !== session.value?.user.id),
      });
    return;
  }

  await updateEmoji({
    messageRowKey: foundEmoji.messageRowKey,
    partitionKey: foundEmoji.partitionKey,
    rowKey: foundEmoji.rowKey,
    userIds: [...foundEmoji.userIds, session.value.user.id],
  });
};
</script>

<template>
  <StyledCard :card-props="{ elevation: isHovering ? 12 : 2, ...hoverProps }">
    <v-card-actions p-0="!" min-h="auto!">
      <StyledEmojiPicker
        :tooltip-props="{ text: 'Add Reaction' }"
        :button-props="{ size: 'small' }"
        :button-attrs="{ rd: '0!' }"
        @update:menu="(value) => emit('update:menu', value)"
        @select="onSelect"
      />
      <v-tooltip text="Edit">
        <template #activator="{ props: tooltipProps }">
          <v-btn
            v-if="isCreator"
            m-0="!"
            rd-none="!"
            icon="mdi-pencil"
            size="small"
            :="tooltipProps"
            @click="emit('update:update-mode', true)"
          />
        </template>
      </v-tooltip>
      <v-menu transition="none" location="left" @update:model-value="(value) => emit('update:menu', value)">
        <template #activator="{ props: menuProps }">
          <v-tooltip text="More">
            <template #activator="{ props: tooltipProps }">
              <v-btn
                m-0="!"
                rd-none="!"
                icon="mdi-dots-horizontal"
                size="small"
                :="mergeProps(menuProps, tooltipProps)"
              />
            </template>
          </v-tooltip>
        </template>
        <v-list>
          <v-list-item v-for="item of items" :key="item.title" @click="item.onClick">
            <span :class="item.color ? `text-${item.color}` : undefined">{{ item.title }}</span>
            <template #append>
              <v-icon size="small" :icon="item.icon" :color="item.color ?? undefined" />
            </template>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-card-actions>
  </StyledCard>
</template>
