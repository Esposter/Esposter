<script setup lang="ts">
import type { RoomInMessage, RoomRoleInMessage } from "@esposter/db-schema";

import { useRoleStore } from "@/store/message/room/role";
import { withFinalizerAsync } from "@esposter/shared";

interface Props {
  roleId: RoomRoleInMessage["id"];
  roomId: RoomInMessage["id"];
}

const { roleId, roomId } = defineProps<Props>();
const roleStore = useRoleStore();
const { deleteRole } = roleStore;
</script>

<template>
  <StyledDeleteFormDialog
    :card-props="{ title: 'Delete Role' }"
    @delete="
      async (onComplete) => {
        let isSuccessful = false;
        await withFinalizerAsync(
          async () => {
            isSuccessful = await deleteRole({ roomId, id: roleId });
          },
          () => {
            onComplete(isSuccessful);
          },
        );
      }
    "
  >
    <template #activator="{ updateIsOpen }">
      <StyledTooltipIconButton
        :button-props="{ color: 'error', density: 'compact', size: 'x-small', variant: 'plain' }"
        icon="mdi-trash-can-outline"
        text="Delete Role"
        @click.stop="updateIsOpen(true)"
      />
    </template>
    Are you sure you want to delete this role?
  </StyledDeleteFormDialog>
</template>
