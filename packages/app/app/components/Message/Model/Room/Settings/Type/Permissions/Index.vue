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
  <v-container fluid>
    <v-row>
      <v-col>
        <MessageModelRoomSettingsTypePermissionsRoleSelector :room-id />
      </v-col>
      <v-col v-if="selectedRole">
        <MessageModelRoomSettingsTypePermissionsRoleEditor :key="selectedRole.id" :role="selectedRole" :room-id />
      </v-col>
      <v-col v-else class="text-medium-emphasis" align-center d-flex justify-center>
        Select a role to edit its permissions.
      </v-col>
    </v-row>
  </v-container>
</template>
