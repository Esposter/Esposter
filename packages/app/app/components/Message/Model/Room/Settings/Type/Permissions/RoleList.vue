<script setup lang="ts">
import type { RoomInMessage, RoomRoleInMessage } from "@esposter/db-schema";

interface RoleListProps {
  roles: RoomRoleInMessage[];
  roomId: RoomInMessage["id"];
}

const { roles, roomId } = defineProps<RoleListProps>();
</script>

<template>
  <v-list density="compact" rd>
    <MessageModelRoomSettingsTypePermissionsRoleListItem v-for="role of roles" :key="role.id" :role :room-id />
  </v-list>
</template>
