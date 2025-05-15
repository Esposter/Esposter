<script setup lang="ts">
import type { MessageEntity } from "#shared/models/db/message/MessageEntity";
import type { Item } from "@/models/shared/Item";

import { authClient } from "@/services/auth/authClient";
import { useEsbabblerStore } from "@/store/esbabbler";
import { unemojify } from "node-emoji";
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
const { optionsMenu } = storeToRefs(esbabblerStore);
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
const deleteMessageItem: Item = {
  color: "error",
  icon: "mdi-delete",
  onClick: () => {
    emit("update:delete-mode", true);
  },
  title: "Delete Message",
};
const emojiMenuItems: string[] = ["🤣", "👍", "❤️"];
// We only include menu items that will be part of our v-for to generate similar components
const menuItems = computed(() =>
  isEditable.value ? [editMessageItem, forwardMessageItem] : [replyItem, forwardMessageItem],
);
const popupMenuItems = computed(() =>
  isEditable.value
    ? [editMessageItem, replyItem, forwardMessageItem, deleteMessageItem]
    : [replyItem, forwardMessageItem, deleteMessageItem],
);
</script>

<template>
  <StyledCard :card-props="{ elevation: isHovering ? 12 : 2, ...hoverProps }">
    <v-card-actions p-0="!" gap-0 min-h-auto="!">
      <v-tooltip v-for="emoji of emojiMenuItems" :key="emoji">
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
      <v-divider h-6 self-center thickness="2" vertical />
      <StyledEmojiPicker
        :tooltip-props="{ text: 'Add Reaction' }"
        :button-props="{ size: 'small' }"
        :button-attrs="{ 'rd-none': '!' }"
        @update:menu="(value) => emit('update:menu', value)"
        @select="(emoji) => emit('update:select-emoji', emoji)"
      />
      <v-tooltip v-for="{ icon, shortTitle, title, onClick } of menuItems" :key="title" :text="shortTitle ?? title">
        <template #activator="{ props }">
          <v-btn m-0="!" rd-none="!" :icon size="small" :="props" @click="onClick" />
        </template>
      </v-tooltip>
      <v-menu
        :model-value="optionsMenu?.rowKey === message.rowKey"
        transition="none"
        location="left"
        :target="optionsMenu?.target"
        @update:model-value="
          (value) => {
            // We just need to set a placeholder so that the menu will appear
            if (value) optionsMenu = { rowKey: message.rowKey, target: 'true' };
            else optionsMenu = undefined;
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
          <v-list-item v-for="{ title, color, icon, onClick } of popupMenuItems" :key="title" @click="onClick">
            <span :class="color ? `text-${color}` : undefined">{{ title }}</span>
            <template #append>
              <v-icon size="small" :color :icon />
            </template>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-card-actions>
  </StyledCard>
</template>
