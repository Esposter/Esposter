<script setup lang="ts">
import { DEFAULT_READ_LIMIT } from "#shared/services/pagination/constants";
import { useRoomStore } from "@/store/message/room";
import { useMemberStore } from "@/store/message/user/member";

const { readMembers, readMoreMembers } = useReadMembers();
const { isPending } = await readMembers();
const memberStore = useMemberStore();
const { hasMore, members } = storeToRefs(memberStore);
const roomStore = useRoomStore();
const { currentRoom } = storeToRefs(roomStore);
</script>

<template>
  <v-list>
    <template v-if="isPending">
      <MessageModelMemberSkeletonItem v-for="i in DEFAULT_READ_LIMIT" :key="i" />
    </template>
    <template v-else-if="currentRoom">
      <MessageModelMemberListItem v-for="member of members" :key="member.id" :member :room="currentRoom" />
      <StyledWaypoint :is-active="hasMore" @change="readMoreMembers">
        <MessageModelMemberSkeletonItem v-for="i in DEFAULT_READ_LIMIT" :key="i" />
      </StyledWaypoint>
    </template>
  </v-list>
</template>
