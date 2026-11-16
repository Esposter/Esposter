<script setup lang="ts">
import type { MemberInRoom } from "#shared/models/db/room/MemberInRoom";
import type { MemberDialogType } from "#src/models/message/user/MemberDialogType";

import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { useModerationNoteStore } from "#src/store/message/moderation/note";
import { useRoomStore } from "#src/store/message/room/index";

interface Props {
  isSelf: boolean;
  user: Pick<MemberInRoom, "displayName" | "id" | "image" | "name">;
}

const { user } = defineProps<Props>();
const emit = defineEmits<{ "open:dialog": [type: MemberDialogType] }>();
const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const moderationNoteStore = useModerationNoteStore();
const { currentTargetUserId } = storeToRefs(moderationNoteStore);
const { copyUserIdItem, friendItem, isKickable, moderationItems } = useMemberActionItems(
  () => user,
  currentRoomId,
  (type) => {
    emit("open:dialog", type);
  },
);
// Discord leads with adding a stranger or messaging a friend beside the avatar, and keeps the rest under More
const overflowItems = computed(() => [copyUserIdItem, ...moderationItems.value]);
const { readModerationNotes } = useReadModerationNotes(currentRoomId.value, () => user.id);
// The notes action counts them before it is opened, so a moderator who may read them has them read with the card
watchImmediate(isKickable, async (newIsKickable) => {
  if (!newIsKickable) return;
  currentTargetUserId.value = user.id;
  await readModerationNotes();
});
</script>

<template>
  <template v-if="!isSelf">
    <UiButton v-if="friendItem" :variant="UiButtonVariant.Accent" @click="friendItem.onClick?.($event)">
      {{ friendItem.title }}
    </UiButton>
    <UiOverflowMenu :items="overflowItems" :label="`${user.displayName} actions`" />
  </template>
</template>
