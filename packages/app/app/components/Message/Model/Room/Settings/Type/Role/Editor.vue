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
const editedPermissions = ref(role.permissions);
</script>

<template>
  <div font-bold mb-2 text-title-medium>{{ role.name }}</div>
  <MessageModelRoomSettingsTypeRolePermissionList v-model="editedPermissions" />
  <!-- Pinned to the bottom rather than trailing the list, which is Discord's own shape here: the switch that made
       the change is scrolled away by the time the reader looks for a save, and a save they cannot see reads as a
       change that already took -->
  <div v-if="editedPermissions !== role.permissions" py-2 bg-surface flex gap-2 items-center bottom-0 sticky>
    <span flex-1 text-body-medium>You have unsaved changes.</span>
    <v-btn variant="plain" @click="editedPermissions = role.permissions">Reset</v-btn>
    <StyledButton
      :button-props="{ text: 'Save Changes', variant: 'tonal' }"
      @click="updateRole({ id: role.id, permissions: editedPermissions, roomId })"
    />
  </div>
</template>
