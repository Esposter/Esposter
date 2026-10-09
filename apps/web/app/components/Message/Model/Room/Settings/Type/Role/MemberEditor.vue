<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { PermissionOverrideState } from "@/models/message/room/role/PermissionOverrideState";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { RoomPermissionCategoryItems } from "@/services/message/room/role/RoomPermissionCategoryItems";
import { useRoleStore } from "@/store/message/room/role";
import { useMemberStore } from "@/store/message/user/member";
import { checkHasPermission, RoomPermission } from "@esposter/db-schema";

interface Props {
  roomId: RoomInMessage["id"];
  userId: string;
}

const { roomId, userId } = defineProps<Props>();
const roleStore = useRoleStore();
const {
  deleteMemberPermissionOverride,
  getMemberPermissionOverride,
  getMemberRoles,
  getRoles,
  upsertMemberPermissionOverride,
} = roleStore;
const memberStore = useMemberStore();
const { getMemberName } = memberStore;
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
      <h3 flex-1 truncate ui-heading>{{ getMemberName(userId) }}</h3>
      <UiButton :variant="UiButtonVariant.Quiet" @click="isRemoveOpen = true">Remove override</UiButton>
      <UiConfirmDialog
        v-model="isRemoveOpen"
        confirm-label="Remove"
        :confirm="() => deleteMemberPermissionOverride({ roomId, userId })"
        :title="`Remove ${getMemberName(userId)}'s overrides?`"
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
          :title
          @update:model-value="(state) => setState(permission, state)"
        />
      </section>
    </div>
  </div>
</template>
