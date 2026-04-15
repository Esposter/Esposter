<script setup lang="ts">
import type { Room, RoomRole } from "@esposter/db-schema";

interface RoleSelectorProps {
  roles: RoomRole[];
  roomId: Room["id"];
}

const { roles, roomId } = defineProps<RoleSelectorProps>();
const modelValue = defineModel<null | RoomRole>();
const selectedRoleId = ref(roles[0]?.id ?? null);

watchImmediate(selectedRoleId, (newSelectedRoleId) => {
  modelValue.value = roles.find(({ id }) => id === newSelectedRoleId) ?? null;
});

watch(
  () => roles,
  (newRoles) => {
    if (selectedRoleId.value !== null && !newRoles.some(({ id }) => id === selectedRoleId.value))
      selectedRoleId.value = newRoles[0]?.id ?? null;
  },
);
</script>

<template>
  <MessageModelRoomSettingsTypePermissionsCreateRoleForm :room-id @create:role="selectedRoleId = $event.id" />
  <MessageModelRoomSettingsTypePermissionsRoleList
    :roles
    :room-id
    :selected-role-id
    @select="selectedRoleId = $event"
  />
</template>
