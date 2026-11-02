<script setup lang="ts">
import type { RoomInMessage, RoomRoleInMessage } from "@esposter/db-schema";

import { useRoleStore } from "@/store/message/room/role";

interface Props {
  role: RoomRoleInMessage;
  roomId: RoomInMessage["id"];
}

const { role, roomId } = defineProps<Props>();
const roleStore = useRoleStore();
const { checkIsRoleManageable, updateRole } = roleStore;
const { draft: permissions, isDirty, reset, settle } = useStoredDraft(() => role.permissions);
// updateRole refuses a role at or above the reader's top role, so a role the reader does not outrank is held read-only
// rather than offered a save that cannot land
const isRoleManageable = computed(() => checkIsRoleManageable(roomId, role.position));
</script>

<template>
  <div flex flex-col gap-4>
    <h3 truncate ui-heading>{{ role.name }}</h3>
    <MessageModelRoomSettingsTypeRolePermissionList
      v-model="permissions"
      :is-disabled="!isRoleManageable || undefined"
      :room-id
    />
    <MessageModelRoomSettingsUnsavedChangesBar
      v-if="isDirty"
      @reset="reset()"
      @save="
        async () => {
          await updateRole({ id: role.id, permissions, roomId });
          settle();
        }
      "
    />
  </div>
</template>
