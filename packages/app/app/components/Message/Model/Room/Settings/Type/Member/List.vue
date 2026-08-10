<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { DEFAULT_READ_LIMIT } from "#shared/services/pagination/constants";
import { useRoleStore } from "@/store/message/room/role";
import { useMemberStore } from "@/store/message/user/member";

interface MemberListProps {
  roomId: RoomInMessage["id"];
}

const { roomId } = defineProps<MemberListProps>();
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
      <StyledSkeletonListItem v-for="i in DEFAULT_READ_LIMIT" :key="i" />
    </template>
    <template v-else>
      <MessageModelRoomSettingsTypeMemberListItem
        v-for="member of members"
        :key="member.id"
        :active="member.id === selectedMemberId"
        :member
        :room-id
        @click="selectMember(member.id)"
      />
      <StyledWaypoint :is-active="hasMore" @change="readMoreMembers">
        <StyledSkeletonListItem v-for="i in DEFAULT_READ_LIMIT" :key="i" />
      </StyledWaypoint>
    </template>
  </v-list>
</template>
