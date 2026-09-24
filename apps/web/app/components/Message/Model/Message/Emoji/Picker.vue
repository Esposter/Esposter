<script setup lang="ts">
import type { PickableEmoji } from "@/models/message/emoji/PickableEmoji";
import type { UiButtonVariant } from "@/models/ui/UiButtonVariant";

import { useRoomStore } from "@/store/message/room";
import { useRoomEmojiStore } from "@/store/message/room/emoji";
import { useRoleStore } from "@/store/message/room/role";
import { RoomPermission } from "@esposter/db-schema";

interface Props {
  variant?: UiButtonVariant;
}

const isOpen = defineModel<boolean>("isOpen", { default: false });
const { variant } = defineProps<Props>();
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
    v-model:is-open="isOpen"
    :custom-emojis
    :variant
    @select="(emojiTag: string, emoji: PickableEmoji) => emit('select', emojiTag, emoji)"
  >
    <template v-if="hasManageEmojis" #footer>
      <MessageModelRoomEmojiCreateDialog :room-id="currentRoomId">
        <template #activator="{ updateIsOpen }">
          <!-- The picker steps aside for the dialog, which would otherwise open beneath it -->
          <UiButton
            @click.stop="
              () => {
                isOpen = false;
                updateIsOpen(true);
              }
            "
          >
            Add Emoji
          </UiButton>
        </template>
      </MessageModelRoomEmojiCreateDialog>
    </template>
  </StyledEmojiPicker>
</template>
