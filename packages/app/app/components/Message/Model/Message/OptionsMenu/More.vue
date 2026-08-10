<script setup lang="ts">
import type { Item } from "@/models/shared/Item";

import { EmojiMoreMenuItems } from "@/services/message/emoji/EmojiMoreMenuItems";
import { unemojify } from "@/services/message/emoji/unemojify";
import { EMOJI_PICKER_TOOLTIP_TEXT } from "@/services/styled/constants";
import { useMessageStore } from "@/store/message";

interface MessageOptionsMenuProps {
  actionMessageItems: Item[];
  deleteMessageItem?: Item;
  rowKey: string;
  updateMessageMenuItems: Item[];
}

const { actionMessageItems, deleteMessageItem, rowKey, updateMessageMenuItems } =
  defineProps<MessageOptionsMenuProps>();
const emit = defineEmits<{ "update:menu": [value: boolean]; "update:select-emoji": [emoji: string] }>();
const messageStore = useMessageStore();
const { optionsMenu } = storeToRefs(messageStore);
</script>

<template>
  <StyledTooltipMenuIconButton
    :model-value="optionsMenu?.rowKey === rowKey"
    icon="mdi-dots-horizontal"
    text="More"
    :button-props="{ class: 'm-0', size: 'small', tile: true }"
    :menu-props="{ location: 'left', target: optionsMenu?.target, transition: 'none' }"
    @update:model-value="
      (value) => {
        // We just need to set a placeholder so that the menu will appear
        if (value) optionsMenu = { rowKey, target: 'true' };
        else optionsMenu = undefined;
        emit('update:menu', value);
      }
    "
  >
    <v-list density="compact" text-body-medium>
      <v-list-item>
        <div flex gap-x-2>
          <v-tooltip v-for="emoji of EmojiMoreMenuItems" :key="emoji" :text="unemojify(emoji)">
            <template #activator="{ props }">
              <v-btn
                :text="emoji"
                icon
                m-0
                rd-sm
                flex-1
                size-10
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
            {{ EMOJI_PICKER_TOOLTIP_TEXT }}
            <template #append>
              <v-icon size="small" icon="mdi-emoticon" />
            </template>
          </v-list-item>
        </template>
      </StyledEmojiPicker>
      <MessageModelMessageOptionsMenuSection :items="updateMessageMenuItems" />
      <MessageModelMessageOptionsMenuSection :items="actionMessageItems" />
      <MessageModelMessageOptionsMenuSection :items="deleteMessageItem ? [deleteMessageItem] : []" />
    </v-list>
  </StyledTooltipMenuIconButton>
</template>
