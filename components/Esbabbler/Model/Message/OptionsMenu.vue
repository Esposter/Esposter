<script setup lang="ts">
import type { MessageEntity } from "@/models/esbabbler/message";
import type { CreateEmojiInput, DeleteEmojiInput, UpdateEmojiInput } from "@/server/trpc/routers/emoji";
import { useEmojiStore } from "@/store/esbabbler/emoji";
import { unemojify } from "node-emoji";
import { mergeProps } from "vue";

interface MessageOptionsMenuProps {
  message: MessageEntity;
  isHovering?: boolean;
  hoverProps?: Record<string, unknown>;
}

interface AItemEntity {
  title: string;
  icon: string;
  color?: string;
  onClick: (e: MouseEvent | KeyboardEvent) => void;
}

const { message, isHovering, hoverProps } = defineProps<MessageOptionsMenuProps>();
const emit = defineEmits<{
  "update:menu": [value: boolean];
  "update:update-mode": [value: true];
  "update:delete-mode": [value: true];
}>();
const { $client } = useNuxtApp();
const { session } = useAuth();
const emojiStore = useEmojiStore();
const { getEmojiList, createEmoji, updateEmoji, deleteEmoji } = emojiStore;
const emojis = computed(() => getEmojiList(message.rowKey));
const isCreator = computed(() => session.value?.user.id === message.creatorId);
const items = computed(() => {
  if (!isCreator.value) return [];

  const result: AItemEntity[] = [];
  result.unshift({ title: "Update Message", icon: "mdi-pencil", onClick: () => emit("update:update-mode", true) });
  result.push({
    title: "Delete Message",
    icon: "mdi-delete",
    color: "error",
    onClick: () => emit("update:delete-mode", true),
  });
  return result;
});

const onSelect = async (emoji: string) => {
  if (!session.value) return;

  const emojiTag = unemojify(emoji);
  const foundEmoji = emojis.value.find((e) => e.emojiTag === emojiTag);
  if (!foundEmoji) {
    await onCreateEmoji({
      partitionKey: message.partitionKey,
      messageRowKey: message.rowKey,
      emojiTag,
    });
    return;
  }

  if (foundEmoji.userIds.includes(session.value.user.id)) {
    if (foundEmoji.userIds.length === 1)
      await onDeleteEmoji({
        partitionKey: foundEmoji.partitionKey,
        rowKey: foundEmoji.rowKey,
        messageRowKey: foundEmoji.messageRowKey,
      });
    else
      await onUpdateEmoji({
        partitionKey: foundEmoji.partitionKey,
        rowKey: foundEmoji.rowKey,
        messageRowKey: foundEmoji.messageRowKey,
        userIds: foundEmoji.userIds.filter((userId) => userId !== session.value?.user.id),
      });
    return;
  }

  await onUpdateEmoji({
    partitionKey: foundEmoji.partitionKey,
    rowKey: foundEmoji.rowKey,
    messageRowKey: foundEmoji.messageRowKey,
    userIds: [...foundEmoji.userIds, session.value.user.id],
  });
};
const onCreateEmoji = async (input: CreateEmojiInput) => {
  const newEmoji = await $client.emoji.createEmoji.mutate(input);
  if (newEmoji) createEmoji(newEmoji);
};
const onUpdateEmoji = async (input: UpdateEmojiInput) => {
  const updatedEmoji = await $client.emoji.updateEmoji.mutate(input);
  if (updatedEmoji) updateEmoji(updatedEmoji);
};
const onDeleteEmoji = async (input: DeleteEmojiInput) => {
  await $client.emoji.deleteEmoji.mutate(input);
  deleteEmoji(input);
};
</script>

<template>
  <StyledCard :elevation="isHovering ? 12 : 2" :="hoverProps">
    <v-card-actions p-0="!" min-h="auto!">
      <EmojiPicker
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
            rd-0="!"
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
              <v-btn m-0="!" rd-0="!" icon="mdi-dots-horizontal" size="small" :="mergeProps(menuProps, tooltipProps)" />
            </template>
          </v-tooltip>
        </template>
        <v-list>
          <v-list-item v-for="item in items" :key="item.title" @click="item.onClick">
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
