<script setup lang="ts">
import type { User } from "@esposter/db-schema";

import { checkIsMemberManageable } from "#shared/services/room/rbac/checkIsMemberManageable";
import { useRoomStore } from "@/store/message/room";
import { useRoleStore } from "@/store/message/room/role";
import { useUserToRoomStore } from "@/store/message/room/userToRoom";
import { AdminActionType, checkHasPermission, RoomPermission } from "@esposter/db-schema";

interface Props {
  roomId: string;
  user: Pick<User, "id" | "name">;
}

const { roomId, user } = defineProps<Props>();
const roomStore = useRoomStore();
const { rooms } = storeToRefs(roomStore);
const roleStore = useRoleStore();
const { getMemberRoleMap, getMyPermissions } = roleStore;
const userToRoomStore = useUserToRoomStore();
const { getDisplayName } = userToRoomStore;
// The moderator picked this member off a list that names them by nickname, so every confirmation names them
// The same way
const displayName = computed(() => getDisplayName(user, roomId));
// An unloaded member role map is not the same as a member with no roles: the first hides the actions until the
// Roles arrive, the second is a real position below every assigned role
const targetTopPosition = computed(() => {
  const roles = getMemberRoleMap(roomId)?.get(user.id);
  if (!roles) return undefined;
  return Math.max(-1, ...roles.map(({ position }) => position));
});
// The owner is the one member no moderator may act on, and the server says so too — offering the actions here
// Would only surface a rejection
const isTargetOwner = computed(() => rooms.value.find(({ id }) => id === roomId)?.userId === user.id);
const manageablePermissions = computed(() => {
  const permissions = getMyPermissions(roomId);
  if (!permissions || targetTopPosition.value === undefined) return undefined;

  const actor = { isOwner: permissions.isRoomOwner, topPosition: permissions.topRolePosition };
  const target = { isOwner: isTargetOwner.value, topPosition: targetTopPosition.value };
  return checkIsMemberManageable(actor, target) ? permissions : undefined;
});
const checkHasManageablePermission = (permission: RoomPermission) =>
  Boolean(
    manageablePermissions.value &&
    checkHasPermission(manageablePermissions.value.permissions, permission, manageablePermissions.value.isRoomOwner),
  );
const isBannable = computed(() => checkHasManageablePermission(RoomPermission.BanMembers));
const isKickable = computed(() => checkHasManageablePermission(RoomPermission.KickMembers));
const isWarnable = computed(() => checkHasManageablePermission(RoomPermission.ManageMessages));
</script>

<template>
  <template v-if="isBannable || isKickable || isWarnable">
    <MessageModelUserProfileCardMoreMenuConfirmActionDialog
      v-if="isBannable"
      :text="`Are you sure you want to ban ${displayName}?`"
      title="Ban User"
      :type="AdminActionType.CreateBan"
      :user
    />
    <MessageModelUserProfileCardMoreMenuConfirmActionDialog
      v-if="isBannable"
      :text="`Are you sure you want to soft-ban ${displayName}? They will be kicked and their recent messages deleted, but can rejoin via invite.`"
      title="Soft Ban Member"
      :type="AdminActionType.SoftBan"
      :user
    />
    <MessageModelUserProfileCardMoreMenuConfirmActionDialog
      v-if="isKickable"
      :text="`Are you sure you want to kick ${displayName}?`"
      title="Kick Member"
      :type="AdminActionType.KickFromRoom"
      :user
    />
    <MessageModelUserProfileCardMoreMenuTimeoutDialog v-if="isKickable" :display-name :user />
    <MessageModelUserProfileCardMoreMenuWarnDialog v-if="isWarnable" :display-name :user />
    <MessageModelUserProfileCardMoreMenuNotesDialog v-if="isKickable" :display-name :room-id :user />
    <v-list-item py-2 min-height="auto">
      <v-divider />
    </v-list-item>
  </template>
</template>
