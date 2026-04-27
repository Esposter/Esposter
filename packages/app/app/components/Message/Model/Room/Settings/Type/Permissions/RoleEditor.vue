<script setup lang="ts">
import type { RoomInMessage, RoomRoleInMessage } from "@esposter/db-schema";

import { useRoleStore } from "@/store/message/room/role";

interface RoleEditorProps {
  role: RoomRoleInMessage;
  roomId: RoomInMessage["id"];
}

const { role, roomId } = defineProps<RoleEditorProps>();
const roleStore = useRoleStore();
const { updateRole } = roleStore;
const permissions = ref(role.permissions);
const isDirty = computed(() => permissions.value !== role.permissions);
</script>

<template>
  <div mb-2 text-lg font-bold>{{ role.name }}</div>
  <MessageModelRoomSettingsTypePermissionsPermissionList v-model="permissions" />
  <template v-if="isDirty">
    <MessageModelRoomSettingsTypePermissionsSaveButton @save="updateRole({ id: role.id, permissions, roomId })" />
    <MessageModelRoomSettingsTypePermissionsResetButton @reset="permissions = role.permissions" />
  </template>
</template>
