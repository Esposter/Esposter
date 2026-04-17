<script setup lang="ts">
import type { Room } from "@esposter/db-schema";

import { useRoleStore } from "@/store/message/room/role";
import { useMemberStore } from "@/store/message/user/member";

interface EditRolesIndexProps {
  roomId: Room["id"];
}

const ROLES_TAB = "roles";
const MEMBERS_TAB = "members";

const { roomId } = defineProps<EditRolesIndexProps>();
const roleStore = useRoleStore();
const { getRoles } = roleStore;
const { selectedMemberId, selectedRole, selectedRoleId } = storeToRefs(roleStore);
const memberStore = useMemberStore();
const { memberMap } = storeToRefs(memberStore);
const selectedMember = computed(() =>
  selectedMemberId.value ? (memberMap.value.get(selectedMemberId.value) ?? null) : null,
);
const roles = computed(() => getRoles(roomId).toSorted((a, b) => (a.isEveryone ? -1 : b.isEveryone ? 1 : 0)));
const editTab = ref(ROLES_TAB);

watch(editTab, (newEditTab) => {
  if (newEditTab === ROLES_TAB) selectedMemberId.value = null;
  else selectedRoleId.value = null;
});
</script>

<template>
  <div flex h-full gap-x-6>
    <div w-56 flex-shrink-0 flex flex-col>
      <v-tabs v-model="editTab" density="compact" mb-3>
        <v-tab :value="ROLES_TAB">Roles</v-tab>
        <v-tab :value="MEMBERS_TAB">Members</v-tab>
      </v-tabs>
      <div flex-1 overflow-y-auto>
        <v-window v-model="editTab">
          <v-window-item :value="ROLES_TAB">
            <MessageModelRoomSettingsTypePermissionsRoleList :roles :room-id />
          </v-window-item>
          <v-window-item :value="MEMBERS_TAB">
            <MessageModelRoomSettingsTypePermissionsTypeEditRolesMemberPanel :room-id />
          </v-window-item>
        </v-window>
      </div>
    </div>
    <div v-if="selectedRole && editTab === ROLES_TAB" flex-1 overflow-y-auto>
      <MessageModelRoomSettingsTypePermissionsRoleEditor :key="selectedRole.id" :role="selectedRole" :room-id />
    </div>
    <div v-else-if="selectedMember && editTab === MEMBERS_TAB" flex-1 overflow-y-auto>
      <MessageModelRoomSettingsTypePermissionsTypeEditRolesMemberEditor
        :key="selectedMember.id"
        :member="selectedMember"
        :room-id
      />
    </div>
    <div v-else flex-1 flex items-center justify-center text-medium-emphasis>
      {{ editTab === ROLES_TAB ? "Select a role to edit its permissions." : "Select a member to manage their roles." }}
    </div>
  </div>
</template>
