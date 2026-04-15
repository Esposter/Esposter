<script setup lang="ts">
import type { Room, RoomRole } from "@esposter/db-schema";

interface RoleListProps {
  roles: RoomRole[];
  roomId: Room["id"];
}

const { roles, roomId } = defineProps<RoleListProps>();
</script>

<template>
  <v-list density="compact" rounded>
    <MessageModelRoomSettingsTypePermissionsRoleListItem v-for="role of roles" :key="role.id" :role :room-id />
  </v-list>
</template>
