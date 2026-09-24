<script setup lang="ts">
import type { RoomInMessage, RoomRoleInMessage, User } from "@esposter/db-schema";

interface Props {
  role: RoomRoleInMessage;
  roomId: RoomInMessage["id"];
  userId: User["id"];
}

const { role, roomId, userId } = defineProps<Props>();
const { hasRole, isManageable, toggleRole } = useToggleMemberRole(
  () => roomId,
  () => userId,
  () => role,
);
</script>

<template>
  <div ui-row>
    <UiItemContent :title="role.name">
      <template #mark>
        <MessageModelRoomSettingsTypeRoleColorDot :color="role.color" />
      </template>
      <template #append>
        <UiSwitch
          :disabled="!isManageable"
          :label="role.name"
          :model-value="hasRole"
          @update:model-value="toggleRole"
        />
      </template>
    </UiItemContent>
  </div>
</template>
