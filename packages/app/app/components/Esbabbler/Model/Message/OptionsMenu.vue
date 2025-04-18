<script setup lang="ts">
import type { MessageEntity } from "#shared/models/db/message/MessageEntity";

import { authClient } from "@/services/auth/authClient";
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
  "update:reply": [message: MessageEntity];
  "update:select-emoji": [emoji: string];
  "update:update-mode": [value: true];
}>();
const { data: session } = await authClient.useSession(useFetch);
const isCreator = computed(() => session.value?.user.id === message.userId);
const items = computed(() => {
  if (!isCreator.value) return [];

  const result: Item[] = [
    {
      icon: "mdi-pencil",
      onClick: () => {
        emit("update:update-mode", true);
      },
      title: "Edit Message",
    },
    {
      icon: "mdi-reply",
      onClick: () => {
        emit("update:reply", message);
      },
      title: "Reply",
    },
    {
      color: "error",
      icon: "mdi-delete",
      onClick: () => {
        emit("update:delete-mode", true);
      },
      title: "Delete Message",
    },
  ];
  return result;
});
</script>

<template>
  <StyledCard :card-props="{ elevation: isHovering ? 12 : 2, ...hoverProps }">
    <v-card-actions p-0="!" gap-0 min-h-auto="!">
      <StyledEmojiPicker
        :tooltip-props="{ text: 'Add Reaction' }"
        :button-props="{ size: 'small' }"
        :button-attrs="{ 'rd-none': '!' }"
        @update:menu="(value) => emit('update:menu', value)"
        @select="(emoji) => emit('update:select-emoji', emoji)"
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
