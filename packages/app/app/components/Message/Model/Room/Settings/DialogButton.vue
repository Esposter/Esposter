<script setup lang="ts">
import type { StyledDialogActivatorSlotProps } from "@/components/Styled/Dialog.vue";
import type { Room } from "@esposter/db-schema";

import { authClient } from "@/services/auth/authClient";
import { useRoomStore } from "@/store/message/room";
import { useSettingsStore } from "@/store/message/room/settings";
import { DatabaseEntityType } from "@esposter/db-schema";

const settingsStore = useSettingsStore();
const { dialog } = storeToRefs(settingsStore);

interface RoomSettingsDialogButtonProps {
  roomId: Room["id"];
}

defineSlots<{
  activator: (props: StyledDialogActivatorSlotProps & { tooltipProps: Record<string, unknown> }) => VNode;
}>();
const { roomId } = defineProps<RoomSettingsDialogButtonProps>();
const { data: session } = await authClient.useSession(useFetch);
const roomStore = useRoomStore();
const { rooms } = storeToRefs(roomStore);
const room = computed(() => rooms.value.find(({ id }) => id === roomId));
const isCreator = computed(() => room.value?.userId === session.value?.user.id);
</script>

<template>
  <StyledDialog v-if="isCreator" v-model="dialog" fullscreen>
    <template #activator="activatorProps">
      <v-tooltip :text="`${DatabaseEntityType.Room} Settings`">
        <template #activator="{ props: tooltipProps }">
          <slot name="activator" :="{ ...activatorProps, tooltipProps }" />
        </template>
      </v-tooltip>
    </template>
    <v-app>
      <MessageModelRoomSettingsLeftSideBar />
      <MessageModelRoomSettingsRightSideBar />
      <MessageModelRoomSettingsContent :room-id />
    </v-app>
  </StyledDialog>
</template>
