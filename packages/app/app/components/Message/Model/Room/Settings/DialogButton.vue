<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { SettingsType } from "@/models/message/room/SettingsType";
import { SettingsContentMap } from "@/services/message/settings/SettingsContentMap";
import { useRoomStore } from "@/store/message/room";
import { DatabaseEntityType } from "@esposter/db-schema";
import { mergeProps } from "vue";

interface RoomSettingsDialogButtonProps {
  roomId: RoomInMessage["id"];
}

defineSlots<{ activator: (props: Record<string, unknown>) => VNode }>();
const { roomId } = defineProps<RoomSettingsDialogButtonProps>();
const dialog = ref(false);
const settingsType = ref<keyof typeof SettingsContentMap>(SettingsType.Overview);
const isDeleteOpen = ref(false);

const roomStore = useRoomStore();
const { rooms } = storeToRefs(roomStore);
const room = computed(() => rooms.value.find(({ id }) => id === roomId));
</script>

<template>
  <MessageModelRoomConfirmDeleteDialog v-if="room" v-model="isDeleteOpen" :room-id :creator-id="room.userId" />
  <v-dialog v-model="dialog" fullscreen>
    <template #activator="{ props: dialogProps }">
      <v-tooltip :text="`${DatabaseEntityType.Room} Settings`">
        <template #activator="{ props: tooltipProps }">
          <slot name="activator" :="mergeProps(dialogProps, tooltipProps)" />
        </template>
      </v-tooltip>
    </template>
    <v-app>
      <MessageModelRoomSettingsLeftSideBar v-model="settingsType" :room-id @open:delete="isDeleteOpen = true" />
      <MessageModelRoomSettingsRightSideBar @close="dialog = false" />
      <MessageModelRoomSettingsContent :room-id :settings-type />
    </v-app>
  </v-dialog>
</template>
