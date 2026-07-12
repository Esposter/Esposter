<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { useRoleStore } from "@/store/message/room/role";

interface RolesProps {
  room: RoomInMessage;
}

const { room } = defineProps<RolesProps>();
const roleStore = useRoleStore();
const { getRoles } = roleStore;
const { selectedRole } = storeToRefs(roleStore);
const roles = computed(() => getRoles(room.id).toSorted((a, b) => (a.isEveryone ? -1 : b.isEveryone ? 1 : 0)));
</script>

<template>
  <div flex gap-x-6 h-full>
    <div flex shrink-0 flex-col gap-y-3 w-56>
      <MessageModelRoomSettingsTypeRoleCreateForm :room-id="room.id" />
      <div flex-1 overflow-y-auto>
        <MessageModelRoomSettingsTypeRoleList :roles :room-id="room.id" />
      </div>
    </div>
    <div v-if="selectedRole" flex-1 overflow-y-auto>
      <MessageModelRoomSettingsTypeRoleEditor :key="selectedRole.id" :role="selectedRole" :room-id="room.id" />
    </div>
    <div v-else flex flex-1 items-center justify-center op-medium-emphasis>Select a role to edit its permissions.</div>
  </div>
</template>
