<script setup lang="ts">
import type { RoomInMessage, RoomRoleInMessage } from "@esposter/db-schema";

import { useRoleStore } from "@/store/message/room/role";

interface RoleDeleteButtonProps {
  roleId: RoomRoleInMessage["id"];
  roomId: RoomInMessage["id"];
}

const { roleId, roomId } = defineProps<RoleDeleteButtonProps>();
const roleStore = useRoleStore();
const { deleteRole } = roleStore;
</script>

<template>
  <StyledTooltipIconButton
    :button-props="{ color: 'error', density: 'compact', size: 'x-small', variant: 'plain' }"
    icon="mdi-trash-can-outline"
    text="Delete Role"
    @click.stop="deleteRole({ roomId, id: roleId })"
  />
</template>
