<script setup lang="ts">
import type MessageModelRoomDirectMessageFriendPicker from "@/components/Message/Model/Room/DirectMessageFriendPicker.vue";
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
const friendPicker = useTemplateRef<InstanceType<typeof MessageModelRoomDirectMessageFriendPicker>>("friendPicker");
const selectedUserIds = ref<string[]>([]);
const excludedUserIds = computed(() => {
  const excludedUserIds: string[] = [];
  if (session.value) excludedUserIds.push(session.value.user.id);
  excludedUserIds.push(...(directMessageParticipantsMap.value.get(roomId) ?? []).map(({ id }) => id));
  return excludedUserIds;
});
</script>

<template>
  <StyledFormDialog
    v-model="isOpen"
    :card-props="{ title: 'Add People' }"
    :confirm-button-props="{ text: 'Add' }"
    :confirm-button-attrs="{ disabled: selectedUserIds.length === 0 }"
    @submit="
      async (_event, onComplete) => {
        await $trpc.room.directMessage.createDirectMessageParticipant.mutate({
          roomId,
          userId: takeOne(selectedUserIds),
        });
        selectedUserIds = [];
        friendPicker?.reset();
        onComplete();
      }
    "
  >
    <MessageModelRoomDirectMessageFriendPicker ref="friendPicker" v-model="selectedUserIds" :excluded-user-ids />
  </StyledFormDialog>
</template>
