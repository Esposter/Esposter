<script setup lang="ts">
import type { Room } from "@esposter/db-schema";

import { useRoleStore } from "@/store/message/room/role";

interface RoleSelectorProps {
  roomId: Room["id"];
}

const { roomId } = defineProps<RoleSelectorProps>();
const roleStore = useRoleStore();
const { getRoles } = roleStore;
const roles = computed(() => getRoles(roomId).toSorted((a, b) => (a.isEveryone ? -1 : b.isEveryone ? 1 : 0)));
</script>

<template>
  <MessageModelRoomSettingsTypePermissionsCreateRoleForm :room-id />
  <MessageModelRoomSettingsTypePermissionsRoleList :roles :room-id />
</template>
