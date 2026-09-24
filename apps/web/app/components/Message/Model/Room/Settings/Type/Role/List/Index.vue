<script setup lang="ts">
import type { UiListItem } from "@/models/ui/UiListItem";
import type { RoomInMessage, RoomRoleInMessage } from "@esposter/db-schema";

import { useRoleStore } from "@/store/message/room/role";

interface Props {
  roles: RoomRoleInMessage[];
  roomId: RoomInMessage["id"];
}

const { roles, roomId } = defineProps<Props>();
const roleStore = useRoleStore();
const { selectRole } = roleStore;
const { selectedRoleId } = storeToRefs(roleStore);
const roleMap = computed(() => new Map(roles.map((role) => [role.id, role])));
// Each row is marked by the role's own colour, which the mark's slot draws, so the icon under it is never shown
const roleItems = computed(() =>
  roles.map<UiListItem<string>>(({ id, name }) => ({
    icon: "",
    isCurrent: id === selectedRoleId.value,
    title: name,
    value: id,
  })),
);
</script>

<template>
  <UiList :items="roleItems" label="Roles" @select="selectRole">
    <template #mark="{ item }">
      <MessageModelRoomSettingsTypeRoleColorDot :color="roleMap.get(item.value)?.color ?? ''" />
    </template>
    <template #actions="{ item }">
      <MessageModelRoomSettingsTypeRoleDeleteButton
        v-if="!roleMap.get(item.value)?.isEveryone"
        :role-id="item.value"
        :room-id
      />
    </template>
  </UiList>
</template>
