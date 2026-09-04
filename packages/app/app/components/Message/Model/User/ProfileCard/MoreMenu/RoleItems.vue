<script setup lang="ts">
import type { RoomInMessage, User } from "@esposter/db-schema";

import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { useRoleStore } from "@/store/message/room/role";
import { checkHasPermission, RoomPermission } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";

interface Props {
  roomId: RoomInMessage["id"];
  user: Pick<User, "id" | "name">;
}

const { roomId, user } = defineProps<Props>();
const roleStore = useRoleStore();
const { getMyPermissions, getRoles, readMemberRoles } = roleStore;
const roles = computed(() => getRoles(roomId).filter(({ isEveryone }) => !isEveryone));
const hasManageRoles = computed(() => {
  const myPermissions = getMyPermissions(roomId);
  if (!myPermissions) return false;
  return checkHasPermission(myPermissions.permissions, RoomPermission.ManageRoles, myPermissions.isRoomOwner);
});
// The card is a popout that appears on hover, so the member's own roles load behind it rather than blocking it.
// Nothing awaits the read and nobody asked for it, so it reports its own failure — the group renders empty,
// Which is also what a member with no roles looks like
getSynchronizedFunction(() =>
  getResultAsync(() => readMemberRoles({ roomId, userIds: [user.id] })).match(noop, console.error),
)();
</script>

<!-- Discord assigns a role from the member themselves rather than only from a settings list, which is where the
     want happens: reading who someone is is the moment you notice what they should be able to do -->
<template>
  <v-list-group v-if="hasManageRoles && roles.length > 0" value="Roles">
    <template #activator="{ props: activatorProps }">
      <v-list-item :="activatorProps" prepend-icon="mdi-shield-key-outline" title="Roles" />
    </template>
    <MessageModelRoomRoleMemberListItem v-for="role of roles" :key="role.id" :role :room-id :user-id="user.id" />
  </v-list-group>
</template>
