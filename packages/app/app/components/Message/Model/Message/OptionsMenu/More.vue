<script setup lang="ts">
import type { Item } from "@/models/shared/Item";

import { EmojiMoreMenuItems } from "@/services/message/emoji/EmojiMoreMenuItems";
import { getEmojiDescription } from "@/services/message/emoji/getEmojiDescription";
import { EMOJI_PICKER_TOOLTIP_TEXT } from "@/services/styled/constants";
import { useMessageStore } from "@/store/message";

interface OptionsMenuMoreProps {
  actionMessageItems: Item[];
  deleteMessageItem?: Item;
  rowKey: string;
  updateMessageMenuItems: Item[];
}

const { actionMessageItems, deleteMessageItem, rowKey, updateMessageMenuItems } = defineProps<OptionsMenuMoreProps>();
const emit = defineEmits<{ "update:menu": [value: boolean]; "update:select-emoji": [emoji: string] }>();
const messageStore = useMessageStore();
const { optionsMenu } = storeToRefs(messageStore);
const moreMenuProps = computed(() => ({
  location: "left" as const,
  target: optionsMenu.value?.target,
  transition: "none",
}));
</script>

<template>
  <StyledTooltipMenuIconButton
    :model-value="optionsMenu?.rowKey === rowKey"
    icon="mdi-dots-horizontal"
    text="More"
    :button-props="{ class: 'm-0', size: 'small', tile: true }"
    :menu-props="moreMenuProps"
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
          <v-tooltip v-for="emoji of EmojiMoreMenuItems" :key="emoji" :text="getEmojiDescription(emoji)">
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
      <MessageModelMessageEmojiPicker
        @select="
          (emojiTag) => {
            emit('update:select-emoji', emojiTag);
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
      </MessageModelMessageEmojiPicker>
      <MessageModelMessageOptionsMenuSection :items="updateMessageMenuItems" />
      <MessageModelMessageOptionsMenuSection :items="actionMessageItems" />
      <MessageModelMessageOptionsMenuSection :items="deleteMessageItem ? [deleteMessageItem] : []" />
    </v-list>
  </StyledTooltipMenuIconButton>
</template>
