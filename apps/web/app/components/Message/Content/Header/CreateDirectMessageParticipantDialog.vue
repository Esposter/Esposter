<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { useDirectMessageStore } from "#src/store/message/room/directMessage";

interface Props {
  roomId: RoomInMessage["id"];
}

const isOpen = defineModel<boolean>({ default: false });
const { roomId } = defineProps<Props>();
const { data: session } = await useAuthSession();
const directMessageStore = useDirectMessageStore();
const { addDirectMessageParticipants, getDirectMessageParticipants } = directMessageStore;
const friendPicker = useTemplateRef("friendPicker");
const selectedUserIds = ref<string[]>([]);
const excludedUserIds = computed(() => {
  const userIds: string[] = [];
  if (session.value) userIds.push(session.value.user.id);
  userIds.push(...getDirectMessageParticipants(roomId).map(({ id }) => id));
  return userIds;
});
// The dialog closes as the add is sent, so the selection clears with it: the picker is reset beside the write, and
// The write carries the selection as it was taken. A refused add is the write's alert, and the reader picks again
const createDirectMessageParticipants = () => {
  const userIds = selectedUserIds.value;
  selectedUserIds.value = [];
  friendPicker.value?.reset();
  addDirectMessageParticipants(roomId, userIds);
};
</script>

<template>
  <StyledFormDialog
    v-model="isOpen"
    confirm-label="Add"
    :is-confirm-disabled="selectedUserIds.length === 0 || undefined"
    title="Add People"
    :submit="createDirectMessageParticipants"
  >
    <MessageModelRoomDirectMessageFriendPicker
      ref="friendPicker"
      v-model="selectedUserIds"
      :excluded-user-ids
      is-multiple
    />
  </StyledFormDialog>
</template>
