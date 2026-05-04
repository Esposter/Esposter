<script setup lang="ts">
import type { User } from "@esposter/db-schema";

import { hasPermission } from "#shared/services/room/rbac/hasPermission";
import { useRoomStore } from "@/store/message/room";
import { useRoleStore } from "@/store/message/room/role";
import { RoomPermission } from "@esposter/db-schema";

interface ModerationItemsProps {
  user: Pick<User, "id" | "name">;
}

const { user } = defineProps<ModerationItemsProps>();

const roomStore = useRoomStore();
const { currentRoom } = storeToRefs(roomStore);
const roleStore = useRoleStore();
const { getMyPermissions } = roleStore;

const myPermissions = computed(() => (currentRoom.value?.id ? getMyPermissions(currentRoom.value.id) : undefined));
const isBannable = computed(() => {
  if (!myPermissions.value) return false;
  return hasPermission(myPermissions.value.permissions, RoomPermission.BanMembers, myPermissions.value.isRoomOwner);
});
const isKickable = computed(() => {
  if (!myPermissions.value) return false;
  return hasPermission(myPermissions.value.permissions, RoomPermission.KickMembers, myPermissions.value.isRoomOwner);
});
const isWarnable = computed(() => {
  if (!myPermissions.value) return false;
  return hasPermission(myPermissions.value.permissions, RoomPermission.ManageMessages, myPermissions.value.isRoomOwner);
});
const hasModActions = computed(() => currentRoom.value && (isBannable.value || isKickable.value || isWarnable.value));
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
