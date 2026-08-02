<script setup lang="ts">
import { useDirectMessageStore } from "@/store/message/room/directMessage";

const { $trpc } = useNuxtApp();
const directMessageStore = useDirectMessageStore();
const { currentDirectMessage, directMessageParticipantsMap } = storeToRefs(directMessageStore);
const directMessageName = useDirectMessageName(currentDirectMessage);
const participants = computed(() =>
  currentDirectMessage.value ? (directMessageParticipantsMap.value.get(currentDirectMessage.value.id) ?? []) : [],
);
const { executeMutation } = useMutation();
const deleteDirectMessageParticipant = async (userId: string) => {
  const roomId = currentDirectMessage.value?.id;
  if (!roomId) return;
  await executeMutation(() => $trpc.room.directMessage.deleteDirectMessageParticipant.mutate({ roomId, userId }), {
    applyOptimistic: () => {
      // Read here rather than before the call, so this reflects whatever a concurrent removal already stored
      const currentParticipants = directMessageParticipantsMap.value.get(roomId) ?? [];
      const removedIndex = currentParticipants.findIndex(({ id }) => id === userId);
      const removedParticipant = currentParticipants[removedIndex];
      directMessageParticipantsMap.value.set(
        roomId,
        currentParticipants.filter(({ id }) => id !== userId),
      );
      return () => {
        if (!removedParticipant) return;

        // Restore only this participant, at the position it held. Reinstating a whole-list snapshot would
        // Re-add anyone a removal that overlapped this one had already taken out
        const participantsNow = [...(directMessageParticipantsMap.value.get(roomId) ?? [])];
        participantsNow.splice(removedIndex, 0, removedParticipant);
        directMessageParticipantsMap.value.set(roomId, participantsNow);
      };
    },
    // The target is the room-and-participant pair: the same person can be in more than one direct message,
    // So keying on userId alone would make unrelated rooms' removals queue behind each other
    key: `${roomId}-${userId}`,
  });
};
</script>

<template>
  <v-toolbar v-if="currentDirectMessage" density="comfortable">
    <MessageContentShowRoomListButton />
    <StyledAvatar :name="directMessageName" :avatar-props="{ size: 'x-small' }" />
    <div pl-2 flex flex-col min-w-0>
      <span truncate>{{ directMessageName }}</span>
      <div flex gap-x-1 overflow-x-auto>
        <v-chip
          v-for="{ id, image, name } of participants"
          :key="id"
          density="compact"
          size="small"
          closable
          @click:close="deleteDirectMessageParticipant(id)"
        >
          <StyledAvatar mr-1 :image :name :avatar-props="{ size: '1rem' }" />
          {{ name }}
        </v-chip>
      </div>
    </div>
    <template #append>
      <MessageContentHeaderCreateDirectMessageParticipantButton :room-id="currentDirectMessage.id" />
      <MessageContentShowSearchButton />
    </template>
  </v-toolbar>
</template>
