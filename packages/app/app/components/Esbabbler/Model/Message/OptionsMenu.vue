<script setup lang="ts">
import type { MessageEntity } from "#shared/models/db/message/MessageEntity";
import type { OptionMenuItem } from "@/models/esbabbler/message/OptionMenuItem";

import { authClient } from "@/services/auth/authClient";
import { useEsbabblerStore } from "@/store/esbabbler";
import { mergeProps } from "vue";

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
const esbabblerStore = useEsbabblerStore();
const { optionsMenuMap } = storeToRefs(esbabblerStore);
const { data: session } = await authClient.useSession(useFetch);
const isCreator = computed(() => session.value?.user.id === message.userId);
const isEditable = computed(() => isCreator.value && !message.isForward);
const editMessageOptionMenuItem: OptionMenuItem = {
  icon: "mdi-pencil",
  onClick: () => {
    emit("update:update-mode", true);
  },
  shortTitle: "Edit",
  title: "Edit Message",
};
const replyOptionMenuItem: OptionMenuItem = {
  icon: "mdi-reply",
  onClick: () => {
    emit("update:reply", message.rowKey);
  },
  title: "Reply",
};
const forwardMessageOptionMenuItem: OptionMenuItem = {
  icon: "mdi-share",
  onClick: () => {
    emit("update:forward", message.rowKey);
  },
  title: "Forward",
};
const deleteMessageOptionMenuItem: OptionMenuItem = {
  color: "error",
  icon: "mdi-delete",
  onClick: () => {
    emit("update:delete-mode", true);
  },
  title: "Delete Message",
};
// We only include menu items that will be part of our v-for to generate similar components
const menuItems = computed(() =>
  isEditable.value
    ? [editMessageOptionMenuItem, forwardMessageOptionMenuItem]
    : [replyOptionMenuItem, forwardMessageOptionMenuItem],
);
const items = computed(() =>
  isEditable.value
    ? [editMessageOptionMenuItem, replyOptionMenuItem, forwardMessageOptionMenuItem, deleteMessageOptionMenuItem]
    : [replyOptionMenuItem, forwardMessageOptionMenuItem, deleteMessageOptionMenuItem],
);
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
      <v-tooltip v-for="{ icon, shortTitle, title, onClick } of menuItems" :key="title" :text="shortTitle ?? title">
        <template #activator="{ props: tooltipProps }">
          <v-btn v-if="isCreator" m-0="!" rd-none="!" :icon size="small" :="tooltipProps" @click="onClick" />
        </template>
      </v-tooltip>
      <v-menu
        :model-value="Boolean(optionsMenuMap.get(message.rowKey))"
        transition="none"
        location="left"
        :target="optionsMenuMap.get(message.rowKey)"
        @update:model-value="
          (value) => {
            // We just need to set a placholder so that the menu will appear
            if (value) optionsMenuMap.set(message.rowKey, 'true');
            else optionsMenuMap.delete(message.rowKey);
            emit('update:menu', value);
          }
        "
      >
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
          <v-list-item v-for="{ title, color, icon, onClick } of items" :key="title" @click="onClick">
            <span :class="color ? `text-${color}` : undefined">{{ title }}</span>
            <template #append>
              <v-icon size="small" :icon :color />
            </template>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-card-actions>
  </StyledCard>
</template>
