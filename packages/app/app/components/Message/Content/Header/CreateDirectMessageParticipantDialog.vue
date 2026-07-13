<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { authClient } from "@/services/auth/authClient";
import { useDirectMessageStore } from "@/store/message/room/directMessage";

interface CreateDirectMessageParticipantDialogProps {
  roomId: RoomInMessage["id"];
}

const isOpen = defineModel<boolean>({ default: false });
const { roomId } = defineProps<CreateDirectMessageParticipantDialogProps>();
const { $trpc } = useNuxtApp();
const { data: session } = await authClient.useSession(useFetch);
const { directMessageParticipantsMap } = storeToRefs(useDirectMessageStore());
const friendPicker = useTemplateRef("friendPicker");
const selectedUserIds = ref<string[]>([]);
const excludedUserIds = computed(() => {
  const excludedUserIds: string[] = [];
  if (session.value) excludedUserIds.push(session.value.user.id);
  excludedUserIds.push(...(directMessageParticipantsMap.value.get(roomId) ?? []).map(({ id }) => id));
  return excludedUserIds;
});
const executeMutation = useMutation();
// Participant rows apply via the subscription echo — non-optimistic
const createDirectMessageParticipants = async (onComplete: () => void) => {
  await executeMutation(
    () => $trpc.room.directMessage.createDirectMessageParticipants.mutate({ roomId, userIds: selectedUserIds.value }),
    {
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
