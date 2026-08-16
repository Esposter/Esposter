<script setup lang="ts">
import type { RoomInMessage, RoomRoleInMessage, User } from "@esposter/db-schema";

import { checkIsManageable } from "#shared/services/room/rbac/checkIsManageable";
import { useRoleStore } from "@/store/message/room/role";

interface MemberRoleListItemProps {
  isRoomOwner: boolean;
  memberRoles: RoomRoleInMessage[];
  role: RoomRoleInMessage;
  roomId: RoomInMessage["id"];
  topRolePosition: number;
  userId: User["id"];
}

const { isRoomOwner, memberRoles, role, roomId, topRolePosition, userId } = defineProps<MemberRoleListItemProps>();
const roleStore = useRoleStore();
const { assignRole, revokeRole } = roleStore;
const hasRole = computed(() => memberRoles.some(({ id }) => id === role.id));
const isManageable = computed(() => checkIsManageable(topRolePosition, role.position, isRoomOwner));
</script>

<template>
  <v-list-item :title="role.name">
    <template #prepend>
      <MessageModelRoomSettingsTypeRoleColorDot mr-2 :color="role.color" />
    </template>
    <template #append>
      <v-switch
        :disabled="!isManageable"
        :model-value="hasRole"
        density="compact"
        @update:model-value="
          async () => {
            if (hasRole) await revokeRole({ roleId: role.id, roomId, userId });
            else await assignRole({ roleId: role.id, roomId, userId });
          }
        "
      />
    </template>
  </v-list-item>
</template>
