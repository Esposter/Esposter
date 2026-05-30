<script setup lang="ts">
import { useDirectMessageStore } from "@/store/message/room/directMessage";

const directMessageStore = useDirectMessageStore();
const { deleteDirectMessageParticipant } = directMessageStore;
const { currentDirectMessage, directMessageParticipantsMap } = storeToRefs(directMessageStore);
const directMessageName = useDirectMessageName(currentDirectMessage);
const participants = computed(() =>
  currentDirectMessage.value ? (directMessageParticipantsMap.value.get(currentDirectMessage.value.id) ?? []) : [],
);
</script>

<template>
  <v-toolbar v-if="currentDirectMessage" density="comfortable">
    <MessageContentShowRoomListButton />
    <StyledAvatar :name="directMessageName" :avatar-props="{ size: 'x-small' }" />
    <div min-w-0 pl-2 flex flex-col>
      <span truncate>{{ directMessageName }}</span>
      <div flex gap-x-1 overflow-x-auto>
        <v-chip
          v-for="{ id, image, name } of participants"
          :key="id"
          density="compact"
          size="small"
          closable
          @click:close="deleteDirectMessageParticipant({ roomId: currentDirectMessage.id, userId: id })"
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
