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
const { directMessageParticipantsMap } = storeToRefs(useDirectMessageStore());
const { friends } = storeToRefs(useFriendStore());
const friendPicker = useTemplateRef("friendPicker");
const selectedUserIds = ref<string[]>([]);
const excludedUserIds = computed(() => {
  const excludedUserIds: string[] = [];
  if (session.value) excludedUserIds.push(session.value.user.id);
  excludedUserIds.push(...(directMessageParticipantsMap.value.get(roomId) ?? []).map(({ id }) => id));
  return excludedUserIds;
});
const executeMutation = useMutation();
const createDirectMessageParticipants = async (onComplete: () => void) => {
  const previousParticipants = directMessageParticipantsMap.value.get(roomId) ?? [];
  const existingParticipantIds = new Set(previousParticipants.map(({ id }) => id));
  const newParticipants = friends.value.filter(
    ({ id }) => selectedUserIds.value.includes(id) && !existingParticipantIds.has(id),
  );
  await executeMutation(
    () => $trpc.room.directMessage.createDirectMessageParticipants.mutate({ roomId, userIds: selectedUserIds.value }),
    {
      applyOptimistic: () => {
        directMessageParticipantsMap.value.set(roomId, [...newParticipants, ...previousParticipants]);
        return () => {
          directMessageParticipantsMap.value.set(roomId, previousParticipants);
        };
      },
      onSuccess: () => {
        selectedUserIds.value = [];
        friendPicker.value?.reset();
      },
    },
  );
  onComplete();
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
