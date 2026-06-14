<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { TAB_QUERY_PARAMETER_KEY } from "#shared/services/route/constants";
import { useRouteQuery } from "@vueuse/router";
import { PermissionsTab } from "@/models/message/room/PermissionsTab";
import { useRoleStore } from "@/store/message/room/role";
import { useMemberStore } from "@/store/message/user/member";

interface PermissionsProps {
  room: RoomInMessage;
}

const { room } = defineProps<PermissionsProps>();
const roleStore = useRoleStore();
const { getRoles } = roleStore;
const { selectedMemberId, selectedRole } = storeToRefs(roleStore);
const memberStore = useMemberStore();
const { members } = storeToRefs(memberStore);
const selectedMember = computed(() =>
  selectedMemberId.value ? (members.value.find(({ id }) => id === selectedMemberId.value) ?? null) : null,
);
const roles = computed(() => getRoles(room.id).toSorted((a, b) => (a.isEveryone ? -1 : b.isEveryone ? 1 : 0)));
const tab = useRouteQuery<PermissionsTab>(TAB_QUERY_PARAMETER_KEY, PermissionsTab.Roles);
</script>

<template>
  <div flex gap-x-6 h-full>
    <div flex shrink-0 flex-col w-56>
      <v-tabs v-model="tab" density="compact" mb-3>
        <v-tab :value="PermissionsTab.Roles">{{ PermissionsTab.Roles }}</v-tab>
        <v-tab :value="PermissionsTab.Members">{{ PermissionsTab.Members }}</v-tab>
      </v-tabs>
      <div flex-1 overflow-y-auto>
        <v-window v-model="tab" pt-2>
          <v-window-item :value="PermissionsTab.Roles">
            <MessageModelRoomSettingsTypePermissionsCreateRoleForm :room-id="room.id" />
            <MessageModelRoomSettingsTypePermissionsRoleList :roles :room-id="room.id" />
          </v-window-item>
          <v-window-item :value="PermissionsTab.Members">
            <MessageModelRoomSettingsTypePermissionsMemberPanel :room-id="room.id" />
          </v-window-item>
        </v-window>
      </div>
    </div>
    <div v-if="selectedRole && tab === PermissionsTab.Roles" flex-1 overflow-y-auto>
      <MessageModelRoomSettingsTypePermissionsRoleEditor
        :key="selectedRole.id"
        :role="selectedRole"
        :room-id="room.id"
      />
    </div>
    <div v-else-if="selectedMember && tab === PermissionsTab.Members" flex-1 overflow-y-auto>
      <MessageModelRoomSettingsTypePermissionsMemberEditor
        :key="selectedMember.id"
        :member="selectedMember"
        :room-id="room.id"
      />
    </div>
    <div v-else flex flex-1 items-center justify-center op-medium-emphasis>
      {{
        tab === PermissionsTab.Roles
          ? "Select a role to edit its permissions."
          : "Select a member to manage their roles."
      }}
    </div>
  </div>
</template>
