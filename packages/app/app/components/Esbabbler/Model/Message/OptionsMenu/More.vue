<script setup lang="ts">
import type { Item } from "@/models/shared/Item";

import { EMOJI_TEXT } from "@/services/esbabbler/message/constants";
import { useEsbabblerStore } from "@/store/esbabbler";
import { unemojify } from "node-emoji";
import { mergeProps } from "vue";

interface MessageOptionsMenuProps {
  deleteMessageItem: Item;
  rowKey: string;
  updateMessageItems: Item[];
}

const { deleteMessageItem, rowKey, updateMessageItems } = defineProps<MessageOptionsMenuProps>();
const emit = defineEmits<{ "update:menu": [value: boolean]; "update:select-emoji": [emoji: string] }>();
const esbabblerStore = useEsbabblerStore();
const { optionsMenu } = storeToRefs(esbabblerStore);
const emojiMenuItems: string[] = ["🤣", "👍", "❤️", "👌"];
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
          <v-btn m-0="!" rd-none="!" icon="mdi-dots-horizontal" size="small" :="mergeProps(menuProps, tooltipProps)" />
        </template>
      </v-tooltip>
    </template>
    <v-list>
      <v-list-item>
        <div flex gap-x-2>
          <v-tooltip v-for="emoji of emojiMenuItems" :key="emoji" :text="unemojify(emoji)">
            <template #activator="{ props }">
              <v-btn m-0="!" size-10="!" rd-2="!" icon flex-1 :="props" @click="emit('update:select-emoji', emoji)">
                {{ emoji }}
              </v-btn>
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
            <span>{{ EMOJI_TEXT }}</span>
            <template #append>
              <v-icon size="small" icon="mdi-emoticon" />
            </template>
          </v-list-item>
        </template>
      </StyledEmojiPicker>
      <v-list-item py-2="!" min-height="auto">
        <v-divider />
      </v-list-item>
      <v-list-item v-for="{ title, color, icon, onClick } of updateMessageItems" :key="title" @click="onClick">
        <span :class="color ? `text-${color}` : undefined">{{ title }}</span>
        <template #append>
          <v-icon size="small" :color :icon />
        </template>
      </v-list-item>
      <v-list-item py-2="!" min-height="auto">
        <v-divider />
      </v-list-item>
      <v-list-item @click="deleteMessageItem.onClick">
        <span :class="`text-${deleteMessageItem.color}`">{{ deleteMessageItem.title }}</span>
        <template #append>
          <v-icon size="small" :color="deleteMessageItem.color" :icon="deleteMessageItem.icon" />
        </template>
      </v-list-item>
    </v-list>
  </v-menu>
</template>
