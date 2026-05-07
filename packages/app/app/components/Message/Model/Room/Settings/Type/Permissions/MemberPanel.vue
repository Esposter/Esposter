<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { DEFAULT_READ_LIMIT } from "#shared/services/pagination/constants";
import { useRoleStore } from "@/store/message/room/role";
import { useUserToRoomStore } from "@/store/message/room/userToRoom";
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
const userToRoomStore = useUserToRoomStore();
const { getDisplayName } = userToRoomStore;
const displayName = computed(() => getDisplayName(member, roomId));
const { readMembers, readMoreMembers } = useReadMembers();
const { isPending } = await readMembers();
</script>

<template>
  <v-list density="compact" rd>
    <template v-if="isPending">
      <MessageModelMemberSkeletonItem v-for="i in DEFAULT_READ_LIMIT" :key="i" />
    </template>
    <template v-else>
      <v-list-item
        v-for="member of members"
        :key="member.id"
        :active="member.id === selectedMemberId"
        @click="selectMember(member.id)"
      >
        <template #prepend>
          <StyledAvatar :image="member.image" :name="displayName" mr-2 />
        </template>
        <v-list-item-title>{{ displayName }}</v-list-item-title>
      </v-list-item>
      <StyledWaypoint :is-active="hasMore" @change="readMoreMembers">
        <MessageModelMemberSkeletonItem v-for="i in DEFAULT_READ_LIMIT" :key="i" />
      </StyledWaypoint>
    </template>
  </v-list>
</template>
