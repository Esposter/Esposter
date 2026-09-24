<script setup lang="ts">
import type { RoomInMessage, RoomRoleInMessage } from "@esposter/db-schema";

import { useRoleStore } from "@/store/message/room/role";

interface Props {
  role: RoomRoleInMessage;
  roomId: RoomInMessage["id"];
}

const { role, roomId } = defineProps<Props>();
const roleStore = useRoleStore();
const { updateRole } = roleStore;
const editedPermissions = ref(role.permissions);
</script>

<template>
  <div flex flex-col gap-4>
    <h3 truncate ui-heading>{{ role.name }}</h3>
    <MessageModelRoomSettingsTypeRolePermissionList v-model="editedPermissions" />
    <MessageModelRoomSettingsUnsavedChangesBar
      v-if="editedPermissions !== role.permissions"
      @reset="editedPermissions = role.permissions"
      @save="updateRole({ id: role.id, permissions: editedPermissions, roomId })"
    />
  </div>
</template>
