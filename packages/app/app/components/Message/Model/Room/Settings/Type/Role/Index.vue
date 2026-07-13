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
  <v-row no-gutters>
    <v-col cols="4" md="3" lg="2" pe-6 flex flex-col gap-y-3>
      <MessageModelRoomSettingsTypeRoleCreateForm :room-id="room.id" />
      <MessageModelRoomSettingsTypeRoleList :roles :room-id="room.id" />
    </v-col>
    <v-col v-if="selectedRole">
      <MessageModelRoomSettingsTypeRoleEditor :key="selectedRole.id" :role="selectedRole" :room-id="room.id" />
    </v-col>
    <v-col v-else py-12 flex items-center justify-center op-medium-emphasis
      >Select a role to edit its permissions.</v-col
    >
  </v-row>
</template>
