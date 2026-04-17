<script setup lang="ts">
import type { Room } from "@esposter/db-schema";

import { PermissionsTab } from "@/models/message/room/PermissionsTab";
import { useRoleStore } from "@/store/message/room/role";

interface PermissionsSettingsProps {
  roomId: Room["id"];
}

const { roomId } = defineProps<PermissionsSettingsProps>();
const roleStore = useRoleStore();
const { readRoles } = roleStore;
const tab = ref(PermissionsTab.EditRoles);
await readRoles({ roomId });
</script>

<template>
  <div flex flex-col h-full>
    <v-tabs v-model="tab" mb-4>
      <v-tab :value="PermissionsTab.CreateRoles">{{ PermissionsTab.CreateRoles }}</v-tab>
      <v-tab :value="PermissionsTab.EditRoles">{{ PermissionsTab.EditRoles }}</v-tab>
    </v-tabs>
    <v-window v-model="tab" flex-1 overflow-hidden>
      <v-window-item :value="PermissionsTab.CreateRoles" h-full>
        <MessageModelRoomSettingsTypePermissionsTypeCreateRolesIndex :room-id />
      </v-window-item>
      <v-window-item :value="PermissionsTab.EditRoles" h-full>
        <MessageModelRoomSettingsTypePermissionsTypeEditRolesIndex :room-id />
      </v-window-item>
    </v-window>
  </div>
</template>
