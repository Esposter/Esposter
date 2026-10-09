<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useRoleStore } from "@/store/message/room/role";

interface Props {
  room: RoomInMessage;
}

const { room } = defineProps<Props>();
const roleStore = useRoleStore();
const { getRoles, readMemberPermissionOverrides } = roleStore;
const { selectedMemberId, selectedRole } = storeToRefs(roleStore);
const roles = computed(() =>
  getRoles(room.id).toSorted((firstRole, secondRole) => (firstRole.isEveryone ? -1 : secondRole.isEveryone ? 1 : 0)),
);
// The entries are the members a panel opened on, read once so the list shows every override the room holds
onMounted(() => readMemberPermissionOverrides({ roomId: room.id }));
</script>

<!-- Discord's roles editor: the roles and members down one side, under the field that adds one, and the picked one's
     permissions beside them -->
<template>
  <div py-4 gap-6 grid cols-1 ui-body lg:cols-6 md:cols-4 sm:cols-3>
    <div flex flex-col gap-2 min-w-0>
      <MessageModelRoomSettingsTypeRoleCreateForm :room-id="room.id" />
      <MessageModelRoomSettingsTypeRoleList :roles :room-id="room.id" />
    </div>
    <div flex flex-col min-w-0 lg:col-span-5 md:col-span-3 sm:col-span-2>
      <MessageModelRoomSettingsTypeRoleMemberEditor
        v-if="selectedMemberId"
        :key="selectedMemberId"
        :room-id="room.id"
        :user-id="selectedMemberId"
      />
      <MessageModelRoomSettingsTypeRoleEditor
        v-else-if="selectedRole"
        :key="selectedRole.id"
        :role="selectedRole"
        :room-id="room.id"
      />
      <MessageModelRoomSettingsTypeDetailPlaceholder
        v-else
        :meaning="UiIconMeaning.Lock"
        text="Select a role or member to edit its permissions."
      />
    </div>
  </div>
</template>
