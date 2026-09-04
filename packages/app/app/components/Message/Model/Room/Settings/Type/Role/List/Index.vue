<script setup lang="ts">
import type { RoomInMessage, RoomRoleInMessage } from "@esposter/db-schema";

interface Props {
  roles: RoomRoleInMessage[];
  roomId: RoomInMessage["id"];
}

const { roles, roomId } = defineProps<Props>();
</script>

<template>
  <v-list density="compact" rd>
    <MessageModelRoomSettingsTypeRoleListItem v-for="role of roles" :key="role.id" :role :room-id />
  </v-list>
</template>
