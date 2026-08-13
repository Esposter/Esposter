<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { authClient } from "@/services/auth/authClient";
import { useDirectMessageStore } from "@/store/message/room/directMessage";
import { useFriendStore } from "@/store/message/user/friend";

interface CreateDirectMessageParticipantDialogProps {
  roomId: RoomInMessage["id"];
}

const isOpen = defineModel<boolean>({ default: false });
const { roomId } = defineProps<CreateDirectMessageParticipantDialogProps>();
const { $trpc } = useNuxtApp();
const { data: session } = await authClient.useSession(useFetch);
const directMessageStore = useDirectMessageStore();
const { directMessageParticipantsMap } = storeToRefs(directMessageStore);
const friendStore = useFriendStore();
const { friends } = storeToRefs(friendStore);
const friendPicker = useTemplateRef("friendPicker");
const selectedUserIds = ref<string[]>([]);
const excludedUserIds = computed(() => {
  const userIds: string[] = [];
  if (session.value) userIds.push(session.value.user.id);
  userIds.push(...(directMessageParticipantsMap.value.get(roomId) ?? []).map(({ id }) => id));
  return userIds;
});
const { executeMutation } = useMutation();
const createDirectMessageParticipants = async (onComplete: (isSuccessful?: boolean) => void) => {
  let isSuccessful = false;
  await executeMutation(
    () => $trpc.room.directMessage.createDirectMessageParticipants.mutate({ roomId, userIds: selectedUserIds.value }),
    {
      // Read as the write is sent, so this builds on whoever the add ahead of it already stored rather than on
      // The list as it stood when the user confirmed
      applyOptimistic: () => {
        const currentParticipants = directMessageParticipantsMap.value.get(roomId) ?? [];
        const existingParticipantIds = new Set(currentParticipants.map(({ id }) => id));
        const newParticipants = friends.value.filter(
          ({ id }) => selectedUserIds.value.includes(id) && !existingParticipantIds.has(id),
        );
        directMessageParticipantsMap.value.set(roomId, [...newParticipants, ...currentParticipants]);
        return () => {
          // Only the people this write added — reinstating the list it was issued with would re-add anyone a
          // Concurrent removal took out and drop whoever arrived while this write was in flight
          const addedIds = new Set(newParticipants.map(({ id }) => id));
          directMessageParticipantsMap.value.set(
            roomId,
            (directMessageParticipantsMap.value.get(roomId) ?? []).filter(({ id }) => !addedIds.has(id)),
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
    :confirm-button-attrs="{ disabled: selectedUserIds.length === 0 }"
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
