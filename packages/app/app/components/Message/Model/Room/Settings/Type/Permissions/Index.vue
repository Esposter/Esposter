<script setup lang="ts">
import type { Room, RoomRole } from "@esposter/db-schema";

import { useRoleStore } from "@/store/message/room/role";

interface PermissionsSettingsProps {
  roomId: Room["id"];
}

const { roomId } = defineProps<PermissionsSettingsProps>();
const { getRoles, readRoles } = useRoleStore();
await readRoles({ roomId });

const roles = computed(() => getRoles(roomId));
const selectedRole = ref<null | RoomRole>(null);
</script>

<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <MessageModelRoomSettingsTypePermissionsRoleSelector v-model="selectedRole" :roles :room-id />
      </v-col>
      <v-col v-if="selectedRole">
        <MessageModelRoomSettingsTypePermissionsRoleEditor :role="selectedRole" :room-id />
      </v-col>
      <v-col v-else class="text-medium-emphasis" align-center d-flex justify-center>
        Select a role to edit its permissions.
      </v-col>
    </v-row>
  </v-container>
</template>
