<script setup lang="ts">
import { ROOM_NAME_MAX_LENGTH } from "#shared/services/message/constants";
import { authClient } from "@/services/auth/authClient";
import { useLayoutStore } from "@/store/layout";
import { useRoomStore } from "@/store/message/room";

const { data: session } = await authClient.useSession(useFetch);
const { $trpc } = useNuxtApp();
const layoutStore = useLayoutStore();
const { leftDrawerOpenAuto } = storeToRefs(layoutStore);
const roomStore = useRoomStore();
const { currentRoom, currentRoomId, currentRoomName } = storeToRefs(roomStore);
const isCreator = computed(() => currentRoom.value?.userId === session.value?.user.id);
</script>

<template>
  <v-toolbar
    v-if="currentRoom"
    :style="{ paddingLeft: leftDrawerOpenAuto ? '.25rem' : undefined }"
    density="comfortable"
  >
    <MessageContentShowRoomListButton />
    <StyledEditableNameDialogButton
      :card-props="{ title: 'Edit Room' }"
      :max-length="ROOM_NAME_MAX_LENGTH"
      :name="currentRoomName"
      :is-disabled="!isCreator"
      :tooltip-props="{ location: 'bottom', text: 'Edit Room' }"
      @submit="
        async (name) => {
          if (!currentRoomId) return;
          await $trpc.room.updateRoom.mutate({ id: currentRoomId, name });
        }
      "
    >
      <StyledAvatar :image="currentRoom.image" :name="currentRoom.name" :avatar-props="{ size: 'x-small' }" />
      <span pl-2>{{ currentRoomName }}</span>
    </StyledEditableNameDialogButton>
    <template #append>
      <MessageContentAddFriendsDialogButton />
      <MessageContentShowMemberListButton />
      <MessageContentSearchMenu />
    </template>
  </v-toolbar>
</template>

<style scoped lang="scss">
:deep(.v-toolbar__content) {
  min-height: $app-bar-height;
  height: auto !important;
}
</style>
