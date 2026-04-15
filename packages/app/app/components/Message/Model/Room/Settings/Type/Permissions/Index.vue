<script setup lang="ts">
import type { Room } from "@esposter/db-schema";

import { useRoleStore } from "@/store/message/room/role";

interface PermissionsSettingsProps {
  roomId: Room["id"];
}

const { roomId } = defineProps<PermissionsSettingsProps>();
const roleStore = useRoleStore();
const { getRoles, readRoles, updateRole } = roleStore;
await readRoles({ roomId });

const roles = computed(() => getRoles(roomId));
const selectedRoleId = ref(roles.value[0]?.id ?? null);
const selectedRole = computed(() => roles.value.find(({ id }) => id === selectedRoleId.value) ?? null);
const pendingPermissions = ref(selectedRole.value?.permissions ?? 0n);

watch(selectedRole, (newSelectedRole) => {
  pendingPermissions.value = newSelectedRole?.permissions ?? 0n;
});

watch(roles, (newRoles) => {
  if (selectedRoleId.value !== null && !newRoles.some(({ id }) => id === selectedRoleId.value))
    selectedRoleId.value = newRoles[0]?.id ?? null;
});

const isDirty = computed(
  () => selectedRole.value !== null && pendingPermissions.value !== selectedRole.value.permissions,
);

const save = async () => {
  if (!selectedRole.value) return;
  await updateRole({ id: selectedRole.value.id, permissions: pendingPermissions.value, roomId });
};

const reset = () => {
  pendingPermissions.value = selectedRole.value?.permissions ?? 0n;
};
</script>

<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <MessageModelRoomSettingsTypePermissionsCreateRoleForm
          :room-id
          @create:role="selectedRoleId = roles[0]?.id ?? null"
        />
        <MessageModelRoomSettingsTypePermissionsRoleList
          :roles
          :room-id
          :selected-role-id
          @select="selectedRoleId = $event"
        />
      </v-col>
      <v-col v-if="selectedRole">
        <div mb-2 text-lg font-bold>{{ selectedRole.name }}</div>
        <MessageModelRoomSettingsTypePermissionsPermissionList v-model="pendingPermissions" />
        <template v-if="isDirty">
          <MessageModelRoomSettingsTypePermissionsSaveButton @save="save()" />
          <MessageModelRoomSettingsTypePermissionsResetButton @reset="reset()" />
        </template>
      </v-col>
      <v-col v-else class="text-medium-emphasis" align-center d-flex justify-center>
        Select a role to edit its permissions.
      </v-col>
    </v-row>
  </v-container>
</template>
