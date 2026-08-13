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
  <div font-bold mb-2 text-title-medium>{{ role.name }}</div>
  <MessageModelRoomSettingsTypeRolePermissionList v-model="permissions" />
  <template v-if="isDirty">
    <StyledButton
      :button-props="{ text: 'Save Changes', variant: 'tonal' }"
      @click="updateRole({ id: role.id, permissions, roomId })"
    />
    <v-btn variant="plain" @click="permissions = role.permissions">Reset</v-btn>
  </template>
</template>
