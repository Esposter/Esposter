<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { authClient } from "@/services/auth/authClient";
import { useDirectMessageStore } from "@/store/message/room/directMessage";
import { useFriendStore } from "@/store/message/user/friend";

interface Props {
  roomId: RoomInMessage["id"];
}

const isOpen = defineModel<boolean>({ default: false });
const { roomId } = defineProps<Props>();
const { $trpc } = useNuxtApp();
const { data: session } = await authClient.useSession(useFetch);
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
const confirmButtonAttrs = computed(() => ({ disabled: selectedUserIds.value.length === 0 }));
const { executeMutation } = useMutation();
const createDirectMessageParticipants = async (onComplete: (isSuccessful?: boolean) => void) => {
  let isSuccessful = false;
  await executeMutation(
    () => $trpc.room.directMessage.createDirectMessageParticipants.mutate({ roomId, userIds: selectedUserIds.value }),
    {
      applyOptimistic: () => {
        const currentParticipants = getDirectMessageParticipants(roomId);
        const existingParticipantIds = new Set(currentParticipants.map(({ id }) => id));
        const newParticipants = friends.value.filter(
          ({ id }) => selectedUserIds.value.includes(id) && !existingParticipantIds.has(id),
        );
        storeDirectMessageParticipants(roomId, [...newParticipants, ...currentParticipants]);
        return () => {
          const addedIds = new Set(newParticipants.map(({ id }) => id));
          storeDirectMessageParticipants(
            roomId,
            getDirectMessageParticipants(roomId).filter(({ id }) => !addedIds.has(id)),
          );
        };
      },
      key: roomId,
      onSuccess: () => {
        isSuccessful = true;
        selectedUserIds.value = [];
        friendPicker.value?.reset();
      },
    },
  );
  // A failed add keeps the dialog open with the selection intact so the user can retry
  onComplete(isSuccessful);
};
</script>

<template>
  <StyledFormDialog
    v-model="isOpen"
    :card-props="{ title: 'Add People' }"
    :confirm-button-props="{ text: 'Add' }"
    :confirm-button-attrs
    @submit="(_event, onComplete) => createDirectMessageParticipants(onComplete)"
  >
    <MessageModelRoomDirectMessageFriendPicker
      ref="friendPicker"
      v-model="selectedUserIds"
      :excluded-user-ids
      is-multiple
    />
  </StyledFormDialog>
</template>
