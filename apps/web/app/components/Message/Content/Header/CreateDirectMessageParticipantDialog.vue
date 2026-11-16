<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { useDirectMessageStore } from "#src/store/message/room/directMessage";
import { useFriendStore } from "#src/store/message/user/friend";

interface Props {
  roomId: RoomInMessage["id"];
}

const isOpen = defineModel<boolean>({ default: false });
const { roomId } = defineProps<Props>();
const { $trpc } = useNuxtApp();
const { data: session } = await useAuthSession();
const directMessageStore = useDirectMessageStore();
const { getDirectMessageParticipants, storeDirectMessageParticipants } = directMessageStore;
const friendStore = useFriendStore();
const { friends } = storeToRefs(friendStore);
const friendPicker = useTemplateRef("friendPicker");
const selectedUserIds = ref<string[]>([]);
const excludedUserIds = computed(() => {
  const userIds: string[] = [];
  if (session.value) userIds.push(session.value.user.id);
  userIds.push(...getDirectMessageParticipants(roomId).map(({ id }) => id));
  return userIds;
});
const { executeMutation } = useMutation();
// The dialog closes as the add is sent, so the selection clears with it: the picker is reset beside the write, and
// The write carries the selection as it was taken. A refused add is the write's alert, and the reader picks again
const createDirectMessageParticipants = () => {
  const userIds = selectedUserIds.value;
  selectedUserIds.value = [];
  friendPicker.value?.reset();
  executeMutation(() => $trpc.room.directMessage.createDirectMessageParticipants.mutate({ roomId, userIds }), {
    applyOptimistic: () => {
      const currentParticipants = getDirectMessageParticipants(roomId);
      const existingParticipantIds = new Set(currentParticipants.map(({ id }) => id));
      const newParticipants = friends.value.filter(({ id }) => userIds.includes(id) && !existingParticipantIds.has(id));
      storeDirectMessageParticipants(roomId, [...newParticipants, ...currentParticipants]);
      return () => {
        const addedParticipantIds = new Set(newParticipants.map(({ id }) => id));
        storeDirectMessageParticipants(
          roomId,
          getDirectMessageParticipants(roomId).filter(({ id }) => !addedParticipantIds.has(id)),
        );
      };
    },
    key: roomId,
  });
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
