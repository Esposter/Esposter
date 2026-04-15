<script setup lang="ts">
import type { Room, RoomRole } from "@esposter/db-schema";

import { useRoleStore } from "@/store/message/room/role";

interface RoleSelectorProps {
  roles: RoomRole[];
  roomId: Room["id"];
}

const { roles, roomId } = defineProps<RoleSelectorProps>();
const roleStore = useRoleStore();
const { selectRole } = roleStore;
const { selectedRoleId } = storeToRefs(roleStore);
</script>

<template>
  <MessageModelRoomSettingsTypePermissionsCreateRoleForm :room-id />
  <MessageModelRoomSettingsTypePermissionsRoleList :roles :room-id :selected-role-id @select="selectRole($event)" />
</template>
