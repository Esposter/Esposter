<script setup lang="ts">
import type { PickableEmoji } from "#src/models/message/emoji/PickableEmoji";
import type { UiButtonVariant } from "#src/models/ui/UiButtonVariant";

import { useRoomEmojiStore } from "#src/store/message/room/emoji";
import { useRoomEmojiDialogStore } from "#src/store/message/room/emojiDialog";
import { useRoomStore } from "#src/store/message/room/index";
import { useRoleStore } from "#src/store/message/room/role";
import { RoomPermission } from "@esposter/db-schema";

interface Props {
  variant?: UiButtonVariant | undefined;
}
// What a call site passes goes to the picker, beside which the add-emoji dialog stands
defineOptions({ inheritAttrs: false });
const isOpen = defineModel<boolean>("isOpen", { default: false });
defineProps<Props>();
const emit = defineEmits<{ select: [emojiTag: string, emoji: PickableEmoji] }>();
const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const roomEmojiStore = useRoomEmojiStore();
const { customEmojis } = storeToRefs(roomEmojiStore);
const roleStore = useRoleStore();
const { checkHasMyPermission } = roleStore;
const roomEmojiDialogStore = useRoomEmojiDialogStore();
const { isCreateOpen } = storeToRefs(roomEmojiDialogStore);
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
    :="$attrs"
    @select="(emojiTag: string, emoji: PickableEmoji) => emit('select', emojiTag, emoji)"
  >
    <template v-if="hasManageEmojis" #footer>
      <!-- The picker steps aside for the dialog, which the list mounts once for every message -->
      <UiButton
        @click.stop="
          () => {
            isOpen = false;
            isCreateOpen = true;
          }
        "
      >
        Add Emoji
      </UiButton>
    </template>
  </StyledEmojiPicker>
</template>
