<script setup lang="ts">
import type { SettingsContentMap } from "@/services/message/settings/SettingsContentMap";

import { SettingsType } from "@/models/message/room/SettingsType";
import { useRoomStore } from "@/store/message/room";
import { useRoomDialogStore } from "@/store/message/room/dialog";

const roomDialogStore = useRoomDialogStore();
const { settingsRoomId } = storeToRefs(roomDialogStore);
const roomStore = useRoomStore();
const { rooms } = storeToRefs(roomStore);
// Resolved through the primitive rather than a computed of our own, so a target whose room has left the list —
// Deleted, left, or paged out — is dropped with it instead of re-opening this dialog by itself when a later
// Read brings it back
const { isOpen, item: room } = useSingletonDialog(settingsRoomId, () =>
  rooms.value.find(({ id }) => id === settingsRoomId.value),
);
const settingsType = ref<keyof typeof SettingsContentMap>(SettingsType.Overview);
const isDeleteOpen = ref(false);
const isSettingsDrawerOpen = ref(false);
</script>

<template>
  <template v-if="room">
    <MessageModelRoomConfirmDeleteDialog v-model="isDeleteOpen" :room />
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
