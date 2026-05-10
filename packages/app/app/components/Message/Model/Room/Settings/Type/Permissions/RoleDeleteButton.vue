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
  <v-tooltip text="Delete Role">
    <template #activator="{ props }">
      <v-btn
        :="props"
        color="error"
        density="compact"
        icon="mdi-trash-can-outline"
        size="x-small"
        variant="plain"
        @click.stop="deleteRole({ roomId, id: roleId })"
      />
    </template>
  </v-tooltip>
</template>
