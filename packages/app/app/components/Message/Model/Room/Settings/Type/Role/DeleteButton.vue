<script setup lang="ts">
import type { RoomInMessage, RoomRoleInMessage } from "@esposter/db-schema";

import { useRoleStore } from "@/store/message/room/role";
import { withFinalizerAsync } from "@esposter/shared";

interface RoleDeleteButtonProps {
  roleId: RoomRoleInMessage["id"];
  roomId: RoomInMessage["id"];
}

const { roleId, roomId } = defineProps<RoleDeleteButtonProps>();
const roleStore = useRoleStore();
const { deleteRole } = roleStore;
</script>

<template>
  <StyledDeleteFormDialog
    :card-props="{ title: 'Delete Role', text: 'Are you sure you want to delete this role?' }"
    @delete="async (onComplete) => await withFinalizerAsync(() => deleteRole({ roomId, id: roleId }), onComplete)"
  >
    <template #activator="{ updateIsOpen }">
      <StyledTooltipIconButton
        :button-props="{ color: 'error', density: 'compact', size: 'x-small', variant: 'plain' }"
        icon="mdi-trash-can-outline"
        text="Delete Role"
        @click.stop="updateIsOpen(true)"
      />
    </template>
  </StyledDeleteFormDialog>
</template>
