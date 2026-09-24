<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useRoleStore } from "@/store/message/room/role";

interface Props {
  room: RoomInMessage;
}

const { room } = defineProps<Props>();
const roleStore = useRoleStore();
const { getRoles } = roleStore;
const { selectedRole } = storeToRefs(roleStore);
const roles = computed(() =>
  getRoles(room.id).toSorted((firstRole, secondRole) => (firstRole.isEveryone ? -1 : secondRole.isEveryone ? 1 : 0)),
);
</script>

<!-- Discord's roles editor: the roles down one side, under the field that names a new one, and the picked one's
     permissions beside them -->
<template>
  <div py-4 gap-6 grid cols-1 ui-body lg:cols-6 md:cols-4 sm:cols-3>
    <div flex flex-col gap-2 min-w-0>
      <MessageModelRoomSettingsTypeRoleCreateForm :room-id="room.id" />
      <MessageModelRoomSettingsTypeRoleList :roles :room-id="room.id" />
    </div>
    <div flex flex-col min-w-0 lg:col-span-5 md:col-span-3 sm:col-span-2>
      <MessageModelRoomSettingsTypeRoleEditor
        v-if="selectedRole"
        :key="selectedRole.id"
        :role="selectedRole"
        :room-id="room.id"
      />
      <MessageModelRoomSettingsTypeDetailPlaceholder
        v-else
        :meaning="UiIconMeaning.Lock"
        text="Select a role to edit its permissions."
      />
    </div>
  </div>
</template>
