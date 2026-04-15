<script setup lang="ts">
import type { Room, RoomRole } from "@esposter/db-schema";

interface RoleListProps {
  roles: RoomRole[];
  roomId: Room["id"];
  selectedRoleId: null | RoomRole["id"];
}

const { roles, roomId, selectedRoleId } = defineProps<RoleListProps>();
const emit = defineEmits<{ select: [id: RoomRole["id"]] }>();
</script>

<template>
  <v-list density="compact" rounded>
    <MessageModelRoomSettingsTypePermissionsRoleListItem
      v-for="role of roles"
      :key="role.id"
      :is-active="role.id === selectedRoleId"
      :role
      :room-id
      @click="emit('select', role.id)"
    />
  </v-list>
</template>
