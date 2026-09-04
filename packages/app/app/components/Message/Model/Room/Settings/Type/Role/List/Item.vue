<script setup lang="ts">
import type { RoomInMessage, RoomRoleInMessage } from "@esposter/db-schema";

import { useRoleStore } from "@/store/message/room/role";

interface Props {
  role: RoomRoleInMessage;
  roomId: RoomInMessage["id"];
}

const { role, roomId } = defineProps<Props>();
const roleStore = useRoleStore();
const { selectRole } = roleStore;
const { selectedRoleId } = storeToRefs(roleStore);
</script>

<template>
  <v-list-item :active="role.id === selectedRoleId" @click="selectRole(role.id)">
    <template #prepend>
      <MessageModelRoomSettingsTypeRoleColorDot mr-2 :color="role.color" />
    </template>
    <v-list-item-title>{{ role.name }}</v-list-item-title>
    <template v-if="!role.isEveryone" #append>
      <MessageModelRoomSettingsTypeRoleDeleteButton :role-id="role.id" :room-id />
    </template>
  </v-list-item>
</template>
