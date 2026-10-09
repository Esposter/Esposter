<script setup lang="ts">
import type { UiListItem } from "@/models/ui/UiListItem";
import type { RoomInMessage, RoomRoleInMessage } from "@esposter/db-schema";

import { useRoleStore } from "@/store/message/room/role";
import { useMemberStore } from "@/store/message/user/member";

interface Props {
  roles: RoomRoleInMessage[];
  roomId: RoomInMessage["id"];
}

const { roles, roomId } = defineProps<Props>();
const roleStore = useRoleStore();
const { memberPermissionOverrideMap, selectMember, selectRole } = roleStore;
const { selectedMemberId, selectedRoleId } = storeToRefs(roleStore);
const memberStore = useMemberStore();
const { getMemberName } = memberStore;
const roleMap = computed(() => new Map(roles.map((role) => [role.id, role])));
// Each row is marked by the role's own colour, which the mark's slot draws
const roleItems = computed(() =>
  roles.map<UiListItem<string>>(({ id, name }) => ({
    hasMarkSlot: true,
    isCurrent: id === selectedRoleId.value,
    title: name,
    value: id,
  })),
);
// A member is listed while an override holds them, and while they are the one being added, which has no row yet
const memberIds = computed(() => {
  const overriddenMemberIds = [...memberPermissionOverrideMap.keys()];
  return selectedMemberId.value && !overriddenMemberIds.includes(selectedMemberId.value)
    ? [...overriddenMemberIds, selectedMemberId.value]
    : overriddenMemberIds;
});
const memberItems = computed(() =>
  memberIds.value.map<UiListItem<string>>((userId) => ({
    hasMarkSlot: true,
    isCurrent: userId === selectedMemberId.value,
    title: getMemberName(userId),
    value: userId,
  })),
);
</script>

<template>
  <UiList :items="roleItems" label="Roles" @select="(id) => selectRole(id)">
    <template #mark="{ item }">
      <MessageModelRoomSettingsTypeRoleColorDot :color="roleMap.get(item.value)?.color ?? ''" />
    </template>
    <template #actions="{ item }">
      <MessageModelRoomSettingsTypeRoleDeleteButton v-if="!roleMap.get(item.value)?.isEveryone" :role-id="item.value" />
    </template>
  </UiList>
  <UiList v-if="memberItems.length > 0" :items="memberItems" label="Members" @select="(userId) => selectMember(userId)">
    <template #mark="{ item }">
      <UiAvatar :name="item.title" is-small />
    </template>
  </UiList>
  <MessageModelRoomSettingsTypeRoleConfirmDeleteDialog :room-id />
</template>
