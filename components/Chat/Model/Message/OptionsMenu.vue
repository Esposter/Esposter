<script setup lang="ts">
import type { MessageEntity } from "@/models/azure/message";
import { mergeProps } from "vue";
import { useEmojiStore } from "~~/store/chat/useEmojiStore";

interface MessageOptionsMenuProps {
  message: MessageEntity;
  isHovering?: boolean;
  hoverProps?: Record<string, unknown>;
}

interface Item {
  title: string;
  icon: string;
  color?: string;
  onClick: (e: MouseEvent | KeyboardEvent) => void;
}

const props = defineProps<MessageOptionsMenuProps>();
const { message, isHovering, hoverProps } = $(toRefs(props));
const emit = defineEmits<{
  (event: "update:menu", value: boolean): void;
  (event: "update:update-mode", value: true): void;
  (event: "update:delete-mode", value: true): void;
}>();
const { $client } = useNuxtApp();
const { data } = $(useSession());
const emojiStore = useEmojiStore();
const { createEmoji } = emojiStore;
const isCreator = $computed(() => data?.user.id === message.creatorId);
const items = $computed(() => {
  const result: Item[] = [];
  if (!isCreator) return result;

  result.unshift({ title: "Update Message", icon: "mdi-pencil", onClick: () => emit("update:update-mode", true) });
  result.push({
    title: "Delete Message",
    icon: "mdi-delete",
    color: "error",
    onClick: () => emit("update:delete-mode", true),
  });
  return result;
});

const onCreateEmoji = async (emoji: string) => {
  const newEmoji = await $client.emoji.createEmoji.mutate({
    partitionKey: message.partitionKey,
    messageRowKey: message.rowKey,
    emoji,
  });
  if (newEmoji) createEmoji(newEmoji);
};
</script>

<template>
  <v-card :elevation="isHovering ? 12 : 2" :="hoverProps">
    <v-card-actions p="0!" min-h="auto!">
      <EmojiPicker
        :tooltip-props="{ text: 'Add Reaction' }"
        :button-props="{ size: 'small' }"
        :button-attrs="{ rd: '0!' }"
        @update:model-value="(value) => emit('update:menu', value)"
        @select="onCreateEmoji"
      />
      <v-btn v-if="isCreator" m="0!" rd="0!" icon="mdi-pencil" size="small" @click="emit('update:update-mode', true)" />
      <v-menu transition="none" location="left" @update:model-value="(value) => emit('update:menu', value)">
        <template #activator="{ props: menuProps }">
          <v-tooltip location="top" text="More">
            <template #activator="{ props: tooltipProps }">
              <v-btn m="0!" rd="0!" icon="mdi-dots-horizontal" size="small" :="mergeProps(menuProps, tooltipProps)" />
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
  </v-card>
</template>
