<script setup lang="ts">
import type { User } from "@esposter/db-schema";

import { checkIsManageable } from "#shared/services/room/rbac/checkIsManageable";
import { hasPermission } from "@/services/room/rbac/hasPermission";
import { useRoleStore } from "@/store/message/room/role";
import { AdminActionType, RoomPermission } from "@esposter/db-schema";

interface ModerationItemsProps {
  roomId: string;
  user: Pick<User, "id" | "name">;
}

const { roomId, user } = defineProps<ModerationItemsProps>();
const roleStore = useRoleStore();
const { getMemberRoleMap, getMyPermissions } = roleStore;
const myPermissions = computed(() => getMyPermissions(roomId));
const targetTopPosition = computed(() => {
  const roles = getMemberRoleMap(roomId)?.get(user.id);
  if (!roles) return undefined;
  return roles.length > 0 ? Math.max(...roles.map(({ position }) => position)) : -1;
});
const manageablePermissions = computed(() => {
  const permissions = myPermissions.value;
  if (
    !permissions ||
    targetTopPosition.value === undefined ||
    !checkIsManageable(permissions.topRolePosition, targetTopPosition.value, permissions.isRoomOwner)
  )
    return undefined;
  return permissions;
});
const checkHasManageablePermission = (permission: RoomPermission) =>
  Boolean(
    manageablePermissions.value &&
    hasPermission(manageablePermissions.value.permissions, permission, manageablePermissions.value.isRoomOwner),
  );
const isBannable = computed(() => checkHasManageablePermission(RoomPermission.BanMembers));
const isKickable = computed(() => checkHasManageablePermission(RoomPermission.KickMembers));
const isWarnable = computed(() => checkHasManageablePermission(RoomPermission.ManageMessages));
const hasModActions = computed(() => isBannable.value || isKickable.value || isWarnable.value);
</script>

<template>
  <template v-if="hasModActions">
    <MessageModelUserProfileCardMoreMenuConfirmActionDialog
      v-if="isBannable"
      :text="`Are you sure you want to ban ${user.name}?`"
      title="Ban User"
      :type="AdminActionType.CreateBan"
      :user
    />
    <MessageModelUserProfileCardMoreMenuConfirmActionDialog
      v-if="isBannable"
      :text="`Are you sure you want to soft-ban ${user.name}? They will be kicked and their recent messages deleted, but can rejoin via invite.`"
      title="Soft Ban Member"
      :type="AdminActionType.SoftBan"
      :user
    />
    <MessageModelUserProfileCardMoreMenuConfirmActionDialog
      v-if="isKickable"
      :text="`Are you sure you want to kick ${user.name}?`"
      title="Kick Member"
      :type="AdminActionType.KickFromRoom"
      :user
    />
    <MessageModelUserProfileCardMoreMenuTimeoutDialog v-if="isKickable" :user />
    <MessageModelUserProfileCardMoreMenuWarnDialog v-if="isWarnable" :user />
    <MessageModelUserProfileCardMoreMenuNotesDialog v-if="isKickable" :room-id :user />
    <v-list-item py-2 min-height="auto">
      <v-divider />
    </v-list-item>
  </template>
</template>
