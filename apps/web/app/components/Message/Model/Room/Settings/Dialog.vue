<script setup lang="ts">
import type { SettingsContentMap } from "#src/services/message/settings/SettingsContentMap";

import { SettingsType } from "#src/models/message/room/SettingsType";
import { useRoomDialogStore } from "#src/store/message/room/dialog";
import { useRoomStore } from "#src/store/message/room/index";

const roomDialogStore = useRoomDialogStore();
const { settingsRoomId } = storeToRefs(roomDialogStore);
const roomStore = useRoomStore();
const { rooms } = storeToRefs(roomStore);
const { isOpen, item: room } = useSingletonDialog(settingsRoomId, () =>
  rooms.value.find(({ id }) => id === settingsRoomId.value),
);
const settingsType = ref<keyof typeof SettingsContentMap>(SettingsType.Overview);
const isDeleteOpen = ref(false);
const isSettingsDrawerOpen = ref(false);
</script>

<template>
  <MessageModelSettingsDialog v-if="room" v-model="isOpen" :title="`${room.name} settings`">
    <MessageModelRoomSettingsLeftSideBar
      v-model="settingsType"
      v-model:is-open="isSettingsDrawerOpen"
      :room
      @open:delete="isDeleteOpen = true"
    />
    <MessageModelRoomSettingsContent :room :settings-type @open:drawer="isSettingsDrawerOpen = true" />
  </MessageModelSettingsDialog>
  <MessageModelRoomConfirmDeleteDialog v-if="room" v-model="isDeleteOpen" :room />
</template>
