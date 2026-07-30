<script setup lang="ts">
import type { SettingsContentMap } from "@/services/message/settings/SettingsContentMap";

import { SettingsType } from "@/models/message/room/SettingsType";
import { useRoomStore } from "@/store/message/room";
import { useDialogStore } from "@/store/message/room/dialog";

const dialogStore = useDialogStore();
const { settingsRoomId } = storeToRefs(dialogStore);
const { isOpen } = useSingletonDialog(settingsRoomId);
const settingsType = ref<keyof typeof SettingsContentMap>(SettingsType.Overview);
const isDeleteOpen = ref(false);
const isSettingsDrawerOpen = ref(false);
const roomStore = useRoomStore();
const { rooms } = storeToRefs(roomStore);
const room = computed(() => rooms.value.find(({ id }) => id === settingsRoomId.value));
</script>

<template>
  <template v-if="room">
    <MessageModelRoomConfirmDeleteDialog v-model="isDeleteOpen" :room-id="room.id" :creator-id="room.userId" />
    <v-dialog v-model="isOpen" fullscreen>
      <v-app>
        <MessageModelRoomSettingsLeftSideBar
          v-model="settingsType"
          v-model:open="isSettingsDrawerOpen"
          :room
          @open:delete="isDeleteOpen = true"
        />
        <MessageModelRoomSettingsContent
          :room
          :settings-type
          @close="isOpen = false"
          @open:drawer="isSettingsDrawerOpen = true"
        />
      </v-app>
    </v-dialog>
  </template>
</template>
