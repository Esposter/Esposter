<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { SettingsType } from "@/models/message/room/SettingsType";
import { authClient } from "@/services/auth/authClient";
import { useRoomStore } from "@/store/message/room";
import { DatabaseEntityType } from "@esposter/db-schema";
import { mergeProps } from "vue";

interface RoomSettingsDialogButtonProps {
  roomId: RoomInMessage["id"];
}

defineSlots<{ activator: (props: Record<string, unknown>) => VNode }>();
const { roomId } = defineProps<RoomSettingsDialogButtonProps>();
const { data: session } = await authClient.useSession(useFetch);
const roomStore = useRoomStore();
const { rooms } = storeToRefs(roomStore);
const room = computed(() => rooms.value.find(({ id }) => id === roomId));
const isCreator = computed(() => room.value?.userId === session.value?.user.id);
const dialog = ref(false);
const settingsType = ref(SettingsType.Webhooks);
</script>

<template>
  <v-dialog v-if="isCreator" v-model="dialog" fullscreen>
    <template #activator="{ props: dialogProps }">
      <v-tooltip :text="`${DatabaseEntityType.Room} Settings`">
        <template #activator="{ props: tooltipProps }">
          <slot name="activator" :="mergeProps(dialogProps, tooltipProps)" />
        </template>
      </v-tooltip>
    </template>
    <v-app>
      <MessageModelRoomSettingsLeftSideBar v-model="settingsType" />
      <MessageModelRoomSettingsRightSideBar @close="dialog = false" />
      <MessageModelRoomSettingsContent :room-id :settings-type />
    </v-app>
  </v-dialog>
</template>
