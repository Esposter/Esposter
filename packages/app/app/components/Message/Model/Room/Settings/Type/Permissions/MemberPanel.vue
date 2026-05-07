<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { DEFAULT_READ_LIMIT } from "#shared/services/pagination/constants";
import { useRoleStore } from "@/store/message/room/role";
import { useMemberStore } from "@/store/message/user/member";

interface MemberPanelProps {
  roomId: RoomInMessage["id"];
}

const { roomId } = defineProps<MemberPanelProps>();
const roleStore = useRoleStore();
const { selectMember } = roleStore;
const { selectedMemberId } = storeToRefs(roleStore);
const memberStore = useMemberStore();
const { hasMore, members } = storeToRefs(memberStore);
const { readMembers, readMoreMembers } = useReadMembers();
const { isPending } = await readMembers();
</script>

<template>
  <v-list density="compact" rd>
    <template v-if="isPending">
      <MessageModelMemberSkeletonItem v-for="i in DEFAULT_READ_LIMIT" :key="i" />
    </template>
    <template v-else>
      <MessageModelRoomSettingsTypePermissionsMemberPanelListItem
        v-for="member of members"
        :key="member.id"
        :active="member.id === selectedMemberId"
        :member
        :room-id
        @click="selectMember(member.id)"
      />
      <StyledWaypoint :is-active="hasMore" @change="readMoreMembers">
        <MessageModelMemberSkeletonItem v-for="i in DEFAULT_READ_LIMIT" :key="i" />
      </StyledWaypoint>
    </template>
  </v-list>
</template>
