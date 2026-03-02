<script setup lang="ts">
import type { Item } from "@/models/shared/Item";

import { EmojiMoreMenuItems } from "@/services/message/emoji/EmojiMoreMenuItems";
import { EMOJI_PICKER_TOOLTIP_TEXT } from "@/services/styled/constants";
import { useMessageStore } from "@/store/message";
import { unemojify } from "node-emoji";
import { mergeProps } from "vue";

interface MessageOptionsMenuProps {
  actionMessageItems: Item[];
  deleteMessageItem?: Item;
  rowKey: string;
  updateMessageItems: Item[];
}

const { actionMessageItems, deleteMessageItem, rowKey, updateMessageItems } = defineProps<MessageOptionsMenuProps>();
const emit = defineEmits<{ "update:menu": [value: boolean]; "update:select-emoji": [emoji: string] }>();
const messageStore = useMessageStore();
const { optionsMenu } = storeToRefs(messageStore);
</script>

<template>
  <v-menu
    :model-value="optionsMenu?.rowKey === rowKey"
    transition="none"
    location="left"
    :target="optionsMenu?.target"
    @update:model-value="
      (value) => {
        // We just need to set a placeholder so that the menu will appear
        if (value) optionsMenu = { rowKey, target: 'true' };
        else optionsMenu = undefined;
        emit('update:menu', value);
      }
    "
  >
    <template #activator="{ props: menuProps }">
      <v-tooltip text="More">
        <template #activator="{ props: tooltipProps }">
          <v-btn m-0 icon="mdi-dots-horizontal" size="small" tile :="mergeProps(menuProps, tooltipProps)" />
        </template>
      </v-tooltip>
    </template>
    <v-list density="compact" text-sm>
      <v-list-item>
        <div flex gap-x-2>
          <v-tooltip v-for="emoji of EmojiMoreMenuItems" :key="emoji" :text="unemojify(emoji)">
            <template #activator="{ props }">
              <v-btn
                m-0
                size-10
                flex-1
                rounded="sm"
                :text="emoji"
                icon
                :="props"
                @click="emit('update:select-emoji', emoji)"
              />
            </template>
          </v-tooltip>
        </div>
      </v-list-item>
      <StyledEmojiPicker
        @select="
          (emoji) => {
            emit('update:select-emoji', emoji);
            optionsMenu = undefined;
            emit('update:menu', false);
          }
        "
      >
        <template #default="menuProps">
          <v-list-item :="menuProps">
            <span>{{ EMOJI_PICKER_TOOLTIP_TEXT }}</span>
            <template #append>
              <v-icon size="small" icon="mdi-emoticon" />
            </template>
          </v-list-item>
        </template>
      </StyledEmojiPicker>
      <template v-if="updateMessageItems.length > 0">
        <v-list-item py-2 min-height="auto">
          <v-divider />
        </v-list-item>
        <v-list-item v-for="{ title, color, icon, onClick } of updateMessageItems" :key="title" @click="onClick">
          <span :class="color ? `text-${color}` : undefined">{{ title }}</span>
          <template #append>
            <v-icon size="small" :color :icon />
          </template>
        </v-list-item>
      </template>
      <template v-if="actionMessageItems.length > 0">
        <v-list-item py-2 min-height="auto">
          <v-divider />
        </v-list-item>
        <v-list-item v-for="{ title, color, icon, onClick } of actionMessageItems" :key="title" @click="onClick">
          <span :class="color ? `text-${color}` : undefined">{{ title }}</span>
          <template #append>
            <v-icon size="small" :color :icon />
          </template>
        </v-list-item>
      </template>
      <template v-if="deleteMessageItem">
        <v-list-item py-2 min-height="auto">
          <v-divider />
        </v-list-item>
        <v-list-item @click="deleteMessageItem.onClick">
          <span :class="`text-${deleteMessageItem.color}`">{{ deleteMessageItem.title }}</span>
          <template #append>
            <v-icon size="small" :color="deleteMessageItem.color" :icon="deleteMessageItem.icon" />
          </template>
        </v-list-item>
      </template>
    </v-list>
  </v-menu>
</template>
