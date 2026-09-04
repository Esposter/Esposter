<script setup lang="ts">
import type { PickableEmoji } from "@/models/message/emoji/PickableEmoji";
import type { VBtn, VTooltip } from "vuetify/components";

import { useRoomStore } from "@/store/message/room";
import { useRoomEmojiStore } from "@/store/message/room/emoji";
import { useRoleStore } from "@/store/message/room/role";
import { RoomPermission } from "@esposter/db-schema";

interface Props {
  buttonProps?: VBtn["$props"];
  tooltipProps?: VTooltip["$props"];
}

defineSlots<{ default?: (props: Record<string, unknown>) => VNode }>();
const menu = defineModel<boolean>("menu", { default: false });
const { buttonProps, tooltipProps } = defineProps<Props>();
const emit = defineEmits<{ select: [emojiTag: string, emoji: PickableEmoji] }>();
const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const roomEmojiStore = useRoomEmojiStore();
const { customEmojis } = storeToRefs(roomEmojiStore);
const roleStore = useRoleStore();
const { checkHasMyPermission } = roleStore;
const hasManageEmojis = computed(
  () => Boolean(currentRoomId.value) && checkHasMyPermission(currentRoomId.value, RoomPermission.ManageEmojis),
);
</script>

<!-- Every picking surface in a room reaches for the same two things: the room's own set, and — for whoever may
     add to it — the way to add one. Adding lives here rather than in room settings alone because the moment a
     reader wants an emoji the room does not have is the moment they are looking at the picker -->
<template>
  <StyledEmojiPicker
    v-model:menu="menu"
    :custom-emojis
    :button-props
    :tooltip-props
    @select="(emojiTag: string, emoji: PickableEmoji) => emit('select', emojiTag, emoji)"
  >
    <template v-if="$slots.default" #default="activatorProps">
      <slot :="activatorProps" />
    </template>
    <template v-if="hasManageEmojis" #footer>
      <MessageModelRoomEmojiCreateDialog :room-id="currentRoomId">
        <template #activator="{ updateIsOpen }">
          <!-- Bordered rather than plain: it is the one action in a bar of standing controls, and a text
           button against the tinted footer reads as a label -->
          <v-btn
            density="comfortable"
            size="small"
            text="Add Emoji"
            variant="outlined"
            @click.stop="updateIsOpen(true)"
          />
        </template>
      </MessageModelRoomEmojiCreateDialog>
    </template>
  </StyledEmojiPicker>
</template>
