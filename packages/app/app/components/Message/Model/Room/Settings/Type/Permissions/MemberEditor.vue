<script setup lang="ts">
import type { Room, RoomRole, User } from "@esposter/db-schema";

import { isManageable } from "#shared/services/room/rbac/isManageable";
import { useRoleStore } from "@/store/message/room/role";

interface MemberEditorProps {
  member: User;
  roomId: Room["id"];
}

const { member, roomId } = defineProps<MemberEditorProps>();
const roleStore = useRoleStore();
const { assignRole, getMemberRoles, getRoles, readMemberRoles, revokeRole } = roleStore;
const { myPermissionsMap } = storeToRefs(roleStore);
const allRoles = computed(() => getRoles(roomId).filter(({ isEveryone }) => !isEveryone));
const memberRoles = computed(() => getMemberRoles(roomId, member.id));
const hasRole = (roleId: string) => memberRoles.value.some(({ id }) => id === roleId);
const isRoleManageable = (role: RoomRole) => {
  const data = myPermissionsMap.value.get(roomId);
  if (!data) return false;
  return isManageable(data.topRolePosition, role.position, data.isRoomOwner);
};

const toggleRole = async (role: RoomRole) => {
  if (hasRole(role.id)) await revokeRole({ roleId: role.id, roomId, userId: member.id });
  else await assignRole({ roleId: role.id, roomId, userId: member.id });
};

await readMemberRoles({ roomId, userIds: [member.id] });
</script>

<template>
  <div>
    <div flex items-center gap-x-3 mb-4>
      <StyledAvatar :image="member.image" :name="member.name" />
      <div text-lg font-bold>{{ member.name }}</div>
    </div>
    <div v-if="allRoles.length === 0" text-medium-emphasis>No roles available.</div>
    <v-list v-else density="compact" rd>
      <v-list-item v-for="role of allRoles" :key="role.id" :title="role.name">
        <template #prepend>
          <div
            mr-2
            rd-full
            size-3
            :style="{ backgroundColor: role.color ?? 'rgb(var(--v-theme-on-surface-variant))' }"
          />
        </template>
        <template #append>
          <v-switch
            :disabled="!isRoleManageable(role)"
            :model-value="hasRole(role.id)"
            color="primary"
            density="compact"
            hide-details
            @update:model-value="toggleRole(role)"
          />
        </template>
      </v-list-item>
    </v-list>
  </div>
</template>
