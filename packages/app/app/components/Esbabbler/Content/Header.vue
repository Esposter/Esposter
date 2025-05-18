<script setup lang="ts">
import { useRoomStore } from "@/store/esbabbler/room";
import { useLayoutStore } from "@/store/layout";

const layoutStore = useLayoutStore();
const { leftDrawerOpenAuto } = storeToRefs(layoutStore);
const { $trpc } = useNuxtApp();
const roomStore = useRoomStore();
const { currentRoomId, currentRoomName } = storeToRefs(roomStore);
</script>

<template>
  <v-toolbar :pl="leftDrawerOpenAuto ? '4' : undefined" b-none density="comfortable">
    <EsbabblerContentShowRoomListButton />
    <StyledEditableToolbarTitle
      px-1
      :initial-value="currentRoomName"
      @update="
        async (value, onComplete) => {
          try {
            if (!currentRoomId || !value || value === currentRoomName) return;
            await $trpc.room.updateRoom.mutate({ id: currentRoomId, name: value });
          } finally {
            onComplete();
          }
        }
      "
    />
    <template #append>
      <EsbabblerContentAddFriendsDialogButton />
      <EsbabblerContentShowMemberListButton />
    </template>
  </v-toolbar>
</template>
