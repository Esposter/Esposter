<script setup lang="ts">
import type { User } from "@esposter/db-schema";

import { hasPermission } from "#shared/services/room/rbac/hasPermission";
import { isManageable } from "#shared/services/room/rbac/isManageable";
import { useRoleStore } from "@/store/message/room/role";
import { RoomPermission } from "@esposter/db-schema";

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
  const manageablePermissions = myPermissions.value;
  if (
    !manageablePermissions ||
    targetTopPosition.value === undefined ||
    !isManageable(manageablePermissions.topRolePosition, targetTopPosition.value, manageablePermissions.isRoomOwner)
  )
    return null;
  return manageablePermissions;
});
const isBannable = computed(
  () =>
    manageablePermissions.value &&
    hasPermission(
      manageablePermissions.value.permissions,
      RoomPermission.BanMembers,
      manageablePermissions.value.isRoomOwner,
    ),
);
const isKickable = computed(
  () =>
    manageablePermissions.value &&
    hasPermission(
      manageablePermissions.value.permissions,
      RoomPermission.KickMembers,
      manageablePermissions.value.isRoomOwner,
    ),
);
const isWarnable = computed(
  () =>
    manageablePermissions.value &&
    hasPermission(
      manageablePermissions.value.permissions,
      RoomPermission.ManageMessages,
      manageablePermissions.value.isRoomOwner,
    ),
);
const hasModActions = computed(() => isBannable.value || isKickable.value || isWarnable.value);
</script>

<template>
  <template v-if="hasModActions">
    <MessageModelUserProfileCardMoreMenuBanDialog v-if="isBannable" :user />
    <MessageModelUserProfileCardMoreMenuSoftBanDialog v-if="isBannable" :user />
    <MessageModelUserProfileCardMoreMenuKickDialog v-if="isKickable" :user />
    <MessageModelUserProfileCardMoreMenuTimeoutDialog v-if="isKickable" :user />
    <MessageModelUserProfileCardMoreMenuWarnDialog v-if="isWarnable" :user />
    <v-list-item py-2 min-height="auto">
      <v-divider />
    </v-list-item>
  </template>
</template>
