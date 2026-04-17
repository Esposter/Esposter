<script setup lang="ts">
import type { Room } from "@esposter/db-schema";

import { useRoleStore } from "@/store/message/room/role";

interface PermissionsSettingsProps {
  roomId: Room["id"];
}

const { roomId } = defineProps<PermissionsSettingsProps>();
const roleStore = useRoleStore();
const { readRoles } = roleStore;
const { selectedRole } = storeToRefs(roleStore);
await readRoles({ roomId });
</script>

<template>
  <div flex h-full gap-x-6>
    <div w-56 flex-shrink-0 flex flex-col>
      <MessageModelRoomSettingsTypePermissionsRoleSelector :room-id />
    </div>
    <div v-if="selectedRole" flex-1 overflow-y-auto>
      <MessageModelRoomSettingsTypePermissionsRoleEditor :key="selectedRole.id" :role="selectedRole" :room-id />
    </div>
    <div v-else flex-1 flex items-center justify-center text-medium-emphasis>
      Select a role to edit its permissions.
    </div>
  </div>
</template>
