<script setup lang="ts">
import { authClient } from "@/services/auth/authClient";
import { useRoomStore } from "@/store/esbabbler/room";
import { useLayoutStore } from "@/store/layout";

const { data: session } = await authClient.useSession(useFetch);
const { $trpc } = useNuxtApp();
const layoutStore = useLayoutStore();
const { leftDrawerOpenAuto } = storeToRefs(layoutStore);
const roomStore = useRoomStore();
const { currentRoom, currentRoomId, currentRoomName } = storeToRefs(roomStore);
const isCreator = computed(() => currentRoom.value?.userId === session.value?.user.id);
</script>

<template>
  <v-toolbar :style="{ paddingLeft: leftDrawerOpenAuto ? '1rem' : undefined }" b-none density="comfortable">
    <EsbabblerContentShowRoomListButton />
    <StyledEditableToolbarTitle
      v-if="isCreator"
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
    <v-toolbar-title v-else font-bold>
      {{ currentRoomName }}
    </v-toolbar-title>
    <template #append>
      <EsbabblerContentAddFriendsDialogButton />
      <EsbabblerContentShowMemberListButton />
      <EsbabblerContentSearchBar />
    </template>
  </v-toolbar>
</template>

<style scoped lang="scss">
:deep(.v-toolbar__content) {
  min-height: $app-bar-height;
  height: auto !important;
}
</style>
