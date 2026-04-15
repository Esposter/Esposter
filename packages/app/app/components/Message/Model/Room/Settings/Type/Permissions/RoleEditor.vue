<script setup lang="ts">
import type { Room, RoomRole } from "@esposter/db-schema";

import { useRoleStore } from "@/store/message/room/role";

interface RoleEditorProps {
  role: RoomRole;
  roomId: Room["id"];
}

const { role, roomId } = defineProps<RoleEditorProps>();
const { updateRole } = useRoleStore();
const permissions = ref(role.permissions);
const isDirty = computed(() => permissions.value !== role.permissions);

watch(
  () => role.permissions,
  (newPermissions) => {
    permissions.value = newPermissions;
  },
);
</script>

<template>
  <div mb-2 text-lg font-bold>{{ role.name }}</div>
  <MessageModelRoomSettingsTypePermissionsPermissionList v-model="permissions" />
  <template v-if="isDirty">
    <MessageModelRoomSettingsTypePermissionsSaveButton @save="updateRole({ id: role.id, permissions, roomId })" />
    <MessageModelRoomSettingsTypePermissionsResetButton @reset="permissions = role.permissions" />
  </template>
</template>
