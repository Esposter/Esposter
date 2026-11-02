<script setup lang="ts">
import type { RoomInMessage, RoomRoleInMessage } from "@esposter/db-schema";

import { useRoleStore } from "@/store/message/room/role";

interface Props {
  role: RoomRoleInMessage;
  roomId: RoomInMessage["id"];
}

const { role, roomId } = defineProps<Props>();
const roleStore = useRoleStore();
const { updateRole } = roleStore;
const { draft: permissions, isDirty, reset, settle } = useStoredDraft(() => role.permissions);
</script>

<template>
  <div flex flex-col gap-4>
    <h3 truncate ui-heading>{{ role.name }}</h3>
    <MessageModelRoomSettingsTypeRolePermissionList v-model="permissions" :room-id />
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
