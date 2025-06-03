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
  <v-toolbar :style="{ paddingLeft: leftDrawerOpenAuto ? '1rem' : undefined }" b-none density="comfortable">
    <EsbabblerContentShowRoomListButton />
    <StyledEditableToolbarTitle
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

<style scoped lang="scss">
:deep(.v-toolbar__content) {
  min-height: $app-bar-height;
  height: auto !important;
}
</style>
