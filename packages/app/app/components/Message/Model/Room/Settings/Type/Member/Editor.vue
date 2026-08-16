<script setup lang="ts">
import type { RoomInMessage, User } from "@esposter/db-schema";

import { useRoleStore } from "@/store/message/room/role";

interface MemberEditorProps {
  member: User;
  roomId: RoomInMessage["id"];
}

const { member, roomId } = defineProps<MemberEditorProps>();
const roleStore = useRoleStore();
const { getMemberRoles, getMyPermissions, getRoles, readMemberRoles } = roleStore;
const allRoles = computed(() => getRoles(roomId).filter(({ isEveryone }) => !isEveryone));
const memberRoles = computed(() => getMemberRoles(roomId, member.id));
const myPermissions = computed(() => getMyPermissions(roomId));

await readMemberRoles({ roomId, userIds: [member.id] });
</script>

<template>
  <div>
    <div mb-4 flex gap-x-3 items-center>
      <StyledAvatar :image="member.image" :name="member.name" />
      <div font-bold text-title-medium>{{ member.name }}</div>
    </div>
    <div v-if="allRoles.length === 0" op-medium-emphasis>No roles available.</div>
    <v-list v-else density="compact" rd>
      <MessageModelRoomSettingsTypeMemberRoleListItem
        v-for="role of allRoles"
        :key="role.id"
        :is-room-owner="myPermissions?.isRoomOwner ?? false"
        :member-roles
        :role
        :room-id
        :top-role-position="myPermissions?.topRolePosition ?? -1"
        :user-id="member.id"
      />
    </v-list>
  </div>
</template>
