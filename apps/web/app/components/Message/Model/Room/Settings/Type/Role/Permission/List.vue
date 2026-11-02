<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { RoomPermissionCategoryItems } from "@/services/message/room/role/RoomPermissionCategoryItems";
import { useRoleStore } from "@/store/message/room/role";
import { checkHasPermission, RoomPermission } from "@esposter/db-schema";

interface Props {
  roomId: RoomInMessage["id"];
}

const modelValue = defineModel<bigint>({ required: true });
const { roomId } = defineProps<Props>();
const { getMyPermissions } = useRoleStore();
// A role may carry no permission its author lacks, and the save judges the whole bitfield it writes. So a switch is
// Offered only when the bitfield with that switch flipped stays within what the reader holds, the owner and an
// Administrator holding all of it
const isFlippable = (permission: bigint) => {
  const myPermissions = getMyPermissions(roomId);
  if (!myPermissions) return false;

  const flippedPermissions = modelValue.value ^ permission;
  return (
    checkHasPermission(myPermissions.permissions, RoomPermission.Administrator, myPermissions.isRoomOwner) ||
    (flippedPermissions & ~myPermissions.permissions) === 0n
  );
};
</script>

<template>
  <div flex flex-col gap-6>
    <section v-for="{ category, permissions } of RoomPermissionCategoryItems" :key="category" flex flex-col>
      <h4 ui-heading>{{ category }}</h4>
      <MessageModelRoomSettingsTypeRolePermissionListItem
        v-for="{ description, permission, title } of permissions"
        :key="title"
        v-model="modelValue"
        :description
        :is-disabled="!isFlippable(permission) || undefined"
        :permission
        :title
      />
    </section>
  </div>
</template>
