<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { checkIsMemberManageable } from "#shared/services/room/rbac/checkIsMemberManageable";
import { PermissionOverrideState } from "@/models/message/room/role/PermissionOverrideState";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { RoomPermissionCategoryItems } from "@/services/message/room/role/RoomPermissionCategoryItems";
import { useRoomStore } from "@/store/message/room";
import { useRoleStore } from "@/store/message/room/role";
import { useUserStore } from "@/store/message/user";
import { checkHasPermission, RoomPermission } from "@esposter/db-schema";

interface Props {
  roomId: RoomInMessage["id"];
  userId: string;
}

const { roomId, userId } = defineProps<Props>();
const roomStore = useRoomStore();
const { rooms } = storeToRefs(roomStore);
const roleStore = useRoleStore();
const {
  checkHasMyPermission,
  deleteMemberPermissionOverride,
  getMemberPermissionOverride,
  getMemberRoles,
  getMyPermissions,
  getRoles,
  readMemberRoles,
  upsertMemberPermissionOverride,
} = roleStore;
// The member's roles place them against the reader, and an override can name a member the panel has not read yet
await readMemberRoles({ roomId, userIds: [userId] });
// Every write here is judged against the member the way the server places them, owner immunity included, so the
// Entry is held as a whole when the reader cannot manage them
const isManageable = computed(() => {
  const myPermissions = getMyPermissions(roomId);
  if (!myPermissions) return false;

  const topPosition = Math.max(-1, ...getMemberRoles(roomId, userId).map(({ position }) => position));
  const isOwner = rooms.value.find(({ id }) => id === roomId)?.userId === userId;
  return checkIsMemberManageable(
    { isOwner: myPermissions.isRoomOwner, topPosition: myPermissions.topRolePosition },
    { isOwner, topPosition },
  );
});
const userStore = useUserStore();
const { getRoomMemberName } = userStore;
const memberName = computed(() => getRoomMemberName(roomId, userId));
// Administrator is answered from the roles alone, so an override cannot hold it and no row offers it
const categories = RoomPermissionCategoryItems.map(({ category, permissions }) => ({
  category,
  permissions: permissions.filter(({ permission }) => permission !== RoomPermission.Administrator),
}));
// What the member holds from their roles and @everyone, read before the override is applied, so an inherit row can say
// What it resolves to
const inheritedPermissions = computed(() =>
  getMemberRoles(roomId, userId).reduce(
    (permissions, { permissions: rolePermissions }) => permissions | rolePermissions,
    getRoles(roomId).find(({ isEveryone }) => isEveryone)?.permissions ?? 0n,
  ),
);
const override = computed(() => getMemberPermissionOverride(roomId, userId));
const isRemoveOpen = ref(false);
const getState = (permission: bigint) => {
  if (override.value.allow & permission) return PermissionOverrideState.Allow;
  else if (override.value.deny & permission) return PermissionOverrideState.Deny;
  else return PermissionOverrideState.Inherit;
};
// Each state is one bit moved, and the write clears it from the other two, so the row is one decision in the end
const setState = (permission: bigint, state: PermissionOverrideState) =>
  upsertMemberPermissionOverride({
    allow: state === PermissionOverrideState.Allow ? permission : 0n,
    deny: state === PermissionOverrideState.Deny ? permission : 0n,
    inherit: state === PermissionOverrideState.Inherit ? permission : 0n,
    roomId,
    userId,
  });
</script>

<!-- A member's entry in the roles panel: the same list of permissions a role's editor shows, each row a three-state
     decision rather than a switch, and the entry's removal returning the member to their roles alone -->
<template>
  <div flex flex-col gap-4>
    <div flex gap-4 items-center>
      <h3 flex-1 truncate ui-heading>{{ memberName }}</h3>
      <UiButton v-if="isManageable" :variant="UiButtonVariant.Quiet" @click="isRemoveOpen = true">
        Remove override
      </UiButton>
      <UiConfirmDialog
        v-model="isRemoveOpen"
        confirm-label="Remove"
        :confirm="() => deleteMemberPermissionOverride({ roomId, userId })"
        :title="`Remove ${memberName}'s overrides?`"
      >
        Their roles decide every permission again.
      </UiConfirmDialog>
    </div>
    <div flex flex-col gap-6>
      <section v-for="{ category, permissions } of categories" :key="category" flex flex-col>
        <h4 ui-heading>{{ category }}</h4>
        <MessageModelRoomSettingsTypeRolePermissionOverrideListItem
          v-for="{ description, permission, title } of permissions"
          :key="title"
          :model-value="getState(permission)"
          :description
          :inherited-value="checkHasPermission(inheritedPermissions, permission, false)"
          :is-allow-disabled="!checkHasMyPermission(roomId, permission) || undefined"
          :is-disabled="!isManageable || undefined"
          :title
          @update:model-value="(state) => setState(permission, state)"
        />
      </section>
    </div>
  </div>
</template>
